SELECT
    c.contragentname                     AS MagazineName,
    COALESCE(SUM(DISTINCT dt.amount), 0) - COALESCE(SUM(DISTINCT f_payments.amount), 0) -
    COALESCE(SUM(DISTINCT kt.amount), 0) AS Debit
FROM
    contragents c
    LEFT JOIN debtTransfers kt ON c.id = kt.kt
    LEFT JOIN debtTransfers dt ON c.id = dt.dt
    LEFT JOIN finances f_payments ON c.id = f_payments.contragentid AND f_payments.financecategoryid IN (
        SELECT financeCategories.id FROM financeCategories WHERE (financeCategories.name = 'Оплата от магазинов')
    )
WHERE
    c.contragenttypeid = '4'
GROUP BY
    c.contragentname