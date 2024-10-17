SELECT
    c.contragentName                                                                AS MagazineName,
    COALESCE(dt.sum, 0) - COALESCE(SUM(f_payments.amount), 0) - COALESCE(kt.sum, 0) AS Debit
FROM
    contragents c
    LEFT JOIN (
        SELECT kt AS kt, SUM(amount) AS sum
        FROM debtTransfers
        GROUP BY kt
    ) kt ON kt.kt = c.id
    LEFT OUTER JOIN (
        SELECT dt AS dt, SUM(amount) AS sum
        FROM debtTransfers
        GROUP BY dt
    ) dt ON dt.dt = c.id
    LEFT JOIN finances f_payments ON c.id = f_payments.contragentid AND f_payments.financecategoryid IN (
        SELECT financeCategories.id FROM financeCategories WHERE financeCategories.name = 'Оплата от магазинов'
    )
WHERE
    c.contragenttypeid = '4'
GROUP BY
    c.contragentname, dt.sum, kt.sum;