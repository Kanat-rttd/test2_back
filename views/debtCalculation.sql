CREATE OR REPLACE VIEW DebtCalculationViews AS
    WITH gdd_dispatches AS (
        SELECT
            gd.contragentid                                                                                      AS contragentid,
            IF(HOUR(gd.createdat) < 14, CAST(gd.createdat AS DATE),
               CAST(gd.createdat + INTERVAL 1 DAY AS DATE))                                                      AS adjusteddate,
            SUM(gdd.quantity * gdd.price)                                                                        AS sales
        FROM
            goodsDispatches gd
            JOIN goodsDispatchDetails gdd ON gd.id = gdd.goodsdispatchid
        WHERE
            gd.dispatch = 0
        GROUP BY gd.contragentid, adjusteddate
    ), gdd_returns AS (
        SELECT
            gd.contragentid                                                                                      AS contragentid,
            IF(HOUR(gd.createdat) < 14, CAST(gd.createdat AS DATE),
               CAST(gd.createdat + INTERVAL 1 DAY AS DATE))                                                      AS adjusteddate,
            SUM(gdd.quantity * gdd.price)                                                                        AS sales
        FROM
            goodsDispatches gd
            JOIN goodsDispatchDetails gdd ON gd.id = gdd.goodsdispatchid
        WHERE
            gd.dispatch = 1
        GROUP BY gd.contragentid, adjusteddate
    ), gdd_dispatches_sums AS (
        SELECT
            gdd_dispatches.contragentid AS contragentid,
            SUM(gdd_dispatches.sales)   AS totalsales
        FROM
            gdd_dispatches
        GROUP BY gdd_dispatches.contragentid
    ), gdd_returns_sums AS (
        SELECT
            gdd_returns.contragentid AS contragentid,
            SUM(gdd_returns.sales)   AS totalreturns
        FROM
            gdd_returns
        GROUP BY gdd_returns.contragentid
    ), expenses_sums AS (
        SELECT
            finances.contragentid AS contragentid,
            SUM(finances.amount)  AS totalexpenses
        FROM
            finances
        WHERE
            (finances.financecategoryid = (
                SELECT fc.id FROM financeCategories fc WHERE fc.name = 'Предварительная оплата услуг реализации'
            ))
        GROUP BY finances.contragentid
    ), payments_sums AS (
        SELECT
            finances.contragentid AS contragentid,
            SUM(finances.amount)  AS totalpayments
        FROM
            finances
        WHERE
            finances.financecategoryid IN (
                SELECT fc.id
                FROM financeCategories fc
                WHERE fc.name IN ('Оплата от реализаторов', 'Сверху (оплата от реализаторов)')
            )
        GROUP BY finances.contragentid
    ), debt_transfers_sums AS (
        SELECT kt.kt AS contragentid, SUM(kt.amount) AS totaldebit FROM debtTransfers kt GROUP BY kt.kt
    ), credit_transfers_sums AS (
        SELECT dt.dt AS contragentid, SUM(dt.amount) AS totalcredit FROM debtTransfers dt GROUP BY dt.dt
    ), overhead_sums AS (
        SELECT
            op.contragentid            AS contragentid,
            COALESCE(SUM(op.price), 0) AS overhead
        FROM
            overPrices op
        WHERE
            op.contragentid IN (
                SELECT gdd_dispatches.contragentid
                FROM gdd_dispatches
            )
        GROUP BY op.contragentid
    )
    SELECT
        c.contragentname                               AS clientname,
        COALESCE(gdd_dispatches_sums.totalsales, 0)    AS sales,
        COALESCE(gdd_returns_sums.totalreturns, 0)     AS returns,
        COALESCE(overhead_sums.overhead, 0)            AS overhead,
        ABS(COALESCE(expenses_sums.totalexpenses, 0))  AS expenses,
        COALESCE(payments_sums.totalpayments, 0)       AS payments,
        COALESCE(debt_transfers_sums.totaldebit, 0)    AS debit,
        COALESCE(credit_transfers_sums.totalcredit, 0) AS credit,
        COALESCE(gdd_dispatches_sums.totalsales, 0) - COALESCE(gdd_returns_sums.totalreturns, 0) +
        COALESCE(overhead_sums.overhead, 0) + ABS(COALESCE(expenses_sums.totalexpenses, 0)) -
        COALESCE(payments_sums.totalpayments, 0) - COALESCE(debt_transfers_sums.totaldebit, 0) +
        COALESCE(credit_transfers_sums.totalcredit, 0) AS debt
    FROM
        contragents c
        LEFT JOIN gdd_dispatches_sums ON c.id = gdd_dispatches_sums.contragentid
        LEFT JOIN gdd_returns_sums ON c.id = gdd_returns_sums.contragentid
        LEFT JOIN expenses_sums ON c.id = expenses_sums.contragentid
        LEFT JOIN payments_sums ON c.id = payments_sums.contragentid
        LEFT JOIN debt_transfers_sums ON c.id = debt_transfers_sums.contragentid
        LEFT JOIN credit_transfers_sums ON c.id = credit_transfers_sums.contragentid
        LEFT JOIN overhead_sums ON c.id = overhead_sums.contragentid
    WHERE
        c.contragenttypeid = 1
    GROUP BY
        c.contragentname, gdd_dispatches_sums.totalsales, gdd_returns_sums.totalreturns, overhead_sums.overhead,
        expenses_sums.totalexpenses, payments_sums.totalpayments, debt_transfers_sums.totaldebit,
        credit_transfers_sums.totalcredit