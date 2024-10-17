WITH gdd_totals AS (
    SELECT
        c.id                          AS contragent_id,
        c.contragentName              AS contragent_name,
        SUM(gdd.price * gdd.quantity) AS total,
        op.price                      AS overhead
    FROM
        goodsDispatches gd
        LEFT JOIN goodsDispatchDetails gdd ON gdd.goodsDispatchId = gd.id
        LEFT JOIN overPrices op ON op.contragentId = gd.contragentId AND MONTH(gd.createdAt) = op.month AND
                                   YEAR(gd.createdAt) = op.year
        LEFT JOIN contragents c ON c.id = gd.contragentId
        LEFT JOIN products p ON p.id = gdd.productId
    GROUP BY gd.id, c.id, c.contragentName, op.price
), gd_totals AS (
    SELECT
        gddt.contragent_id,
        gddt.contragent_name,
        SUM(gddt.total + gddt.overhead) AS total
    FROM
        gdd_totals gddt
    GROUP BY gddt.contragent_name, gddt.contragent_id
)
SELECT
    gdt.contragent_name          AS contragentName,
    gdt.total                    AS goodDispatchesTotal,
    SUM(COALESCE(f_minus.amount, 0)) AS financeMinus,
    SUM(COALESCE(f_plus.amount, 0))  AS financePlus,
    COALESCE(dt_plus.sum, 0)         AS debtTransfersPlus,
    COALESCE(dt_minus.sum, 0)        AS debtTransfersMinus,
    gdt.total - SUM(COALESCE(f_minus.amount, 0)) + SUM(COALESCE(f_plus.amount, 0)) + COALESCE(dt_plus.sum, 0) -
    COALESCE(dt_minus.sum, 0)        AS debt
FROM
    gd_totals gdt
    LEFT OUTER JOIN finances f_minus ON f_minus.contragentId = gdt.contragent_id AND f_minus.financeCategoryId IN (2, 5)
    LEFT OUTER JOIN finances f_plus ON f_plus.contragentId = gdt.contragent_id AND f_plus.financeCategoryId IN (4)
    LEFT OUTER JOIN (
        SELECT kt AS kt, SUM(amount) AS sum
        FROM debtTransfers
        GROUP BY kt
    ) dt_minus ON dt_minus.kt = gdt.contragent_id
    LEFT OUTER JOIN (
        SELECT dt AS dt, SUM(amount) AS sum
        FROM debtTransfers
        GROUP BY dt
    ) dt_plus ON dt_plus.dt = gdt.contragent_id
GROUP BY
    gdt.contragent_name, gdt.total, dt_plus.sum, dt_minus.sum;

