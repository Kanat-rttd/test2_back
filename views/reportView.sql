CREATE OR REPLACE VIEW ReportView AS
    WITH gdd_dispatches AS (
        SELECT
            gd.contragentId                                                                                      AS contragentId,
            IF(HOUR(gd.createdAt) < 14, CAST(gd.createdAt AS DATE),
               CAST(gd.createdAt + INTERVAL 1 DAY AS DATE))                                                      AS adjustedDate,
            SUM(gdd.quantity * gdd.price)                                                                        AS Sales,
            op.price                                                                                             AS Overhead
        FROM
            goodsDispatches gd
            JOIN goodsDispatchDetails gdd ON gd.id = gdd.goodsDispatchId
            LEFT JOIN overPrices op ON gd.contragentId = op.contragentId AND YEAR(gd.createdAt) = op.year AND
                                       MONTH(gd.createdAt) = op.month
        WHERE
            gd.dispatch = 0
        GROUP BY gd.contragentId, adjustedDate, op.price
    ), gdd_returns AS (
        SELECT
            gd.contragentId                                                                                      AS contragentId,
            IF(HOUR(gd.createdAt) < 14, CAST(gd.createdAt AS DATE),
               CAST(gd.createdAt + INTERVAL 1 DAY AS DATE))                                                      AS adjustedDate,
            SUM(gdd.quantity * gdd.price)                                                                        AS Sales
        FROM
            goodsDispatches gd
            JOIN goodsDispatchDetails gdd ON gd.id = gdd.goodsDispatchId
        WHERE
            gd.dispatch = 1
        GROUP BY gd.contragentId, adjustedDate
    )
    SELECT
        c.contragentName                                                            AS ClientName,
        gdd_dispatches.adjustedDate                                                 AS adjustedDate,
        COALESCE(SUM(DISTINCT gdd_dispatches.Sales), 0)                             AS Sales,
        COALESCE(SUM(DISTINCT gdd_returns.Sales), 0)                                AS Returns,
        COALESCE(SUM(DISTINCT gdd_dispatches.Overhead), 0)                          AS Overhead,
        ABS(COALESCE(SUM(f_expenses.amount), 0))                                    AS Expenses,
        COALESCE(SUM(f_payments.amount), 0)                                         AS Payments,
        COALESCE(SUM(DISTINCT kt.amount), 0) - COALESCE(SUM(DISTINCT dt.amount), 0) AS Credit,
        ABS(COALESCE(SUM(DISTINCT gdd_dispatches.Sales), 0) - COALESCE(SUM(DISTINCT gdd_returns.Sales), 0) +
            COALESCE(SUM(DISTINCT gdd_dispatches.Overhead), 0) + ABS(COALESCE(SUM(DISTINCT f_expenses.amount), 0)) -
            COALESCE(SUM(DISTINCT f_payments.amount), 0) - COALESCE(SUM(DISTINCT kt.amount), 0) +
            COALESCE(SUM(DISTINCT dt.amount), 0))                                   AS Debt
    FROM
        contragents c
        LEFT JOIN gdd_dispatches ON c.id = gdd_dispatches.contragentId
        LEFT JOIN gdd_returns
                  ON c.id = gdd_returns.contragentId AND gdd_dispatches.adjustedDate = gdd_returns.adjustedDate
        LEFT JOIN finances f_expenses ON c.id = f_expenses.contragentId AND f_expenses.financeCategoryId = (
            SELECT fc.id FROM financeCategories fc WHERE (fc.name = 'Предварительная оплата услуг реализации')
        )
        LEFT JOIN finances f_payments ON c.id = f_payments.contragentId AND f_payments.financeCategoryId IN (
            SELECT
                fc.id
            FROM
                financeCategories fc
            WHERE
                (fc.name IN ('Оплата от реализаторов', 'Сверху (оплата от реализаторов)'))
        )
        LEFT JOIN debtTransfers kt ON c.id = kt.kt
        LEFT JOIN debtTransfers dt ON c.id = dt.dt
    WHERE
        c.contragentTypeId = 1
        AND gdd_dispatches.adjustedDate IS NOT NULL
    GROUP BY
        c.contragentName, gdd_dispatches.adjustedDate