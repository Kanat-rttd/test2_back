SELECT 
    c.contragentName AS ClientName, 
    COALESCE(SUM(DISTINCT gdd_totals.Sales), 0) AS Sales,
    COALESCE(SUM(DISTINCT gdd_returns.Sales), 0) AS Returns, 
    COALESCE(SUM(DISTINCT gdd_totals.price), 0) AS Overhead, 
    COALESCE(SUM(DISTINCT f_expenses.amount), 0) AS Expenses, 
    COALESCE(SUM(DISTINCT f_payments.amount), 0) AS Payments, 
    COALESCE(SUM(DISTINCT dt.amount), 0) AS Credit, 
    (((( 
        (COALESCE(SUM(DISTINCT gdd_totals.Sales), 0) - COALESCE(SUM(DISTINCT gdd_returns.Sales), 0)) 
        + COALESCE(SUM(DISTINCT op.price), 0)) 
        - ABS(COALESCE(SUM(DISTINCT f_expenses.amount), 0))) 
        - COALESCE(SUM(DISTINCT f_payments.amount), 0)) 
        - COALESCE(SUM(DISTINCT dt.amount), 0)) AS Debt 
FROM 
    contragents c 

    LEFT JOIN (
        SELECT
            gd.contragentId, 
            DATE(gd.createdAt) AS dispatchDate, 
            SUM(gdd.quantity * gdd.price) AS Sales,
            SUM(op.price) AS price
        FROM 
            goodsDispatches gd 
            JOIN goodsDispatchDetails gdd ON (gd.id = gdd.goodsDispatchId)
            LEFT JOIN overPrices op ON (gd.contragentId = op.contragentId AND YEAR(gd.createdAt) = op.year AND MONTH(gd.createdAt) = op.month)
        WHERE 
            gd.dispatch = 0 -- Условие, указывающее на выдачу
        GROUP BY 
                gd.contragentId, DATE(gd.createdAt)
    ) gdd_totals ON (c.id = gdd_totals.contragentId)
 
    LEFT JOIN (
        SELECT 
            gd.contragentId,
            SUM((gdd.quantity * gdd.price)) AS Sales 
        FROM 
            goodsDispatches gd 
            JOIN goodsDispatchDetails gdd ON (gd.id = gdd.goodsDispatchId)
        WHERE 
            gd.dispatch = 1 -- Условие, указывающее на возврат
        GROUP BY 
            gd.contragentId
    ) gdd_returns ON (c.id = gdd_returns.contragentId)
    
    LEFT JOIN finances f_expenses ON (
        (c.id = f_expenses.contragentId) AND 
        (f_expenses.financeCategoryId = (
            SELECT financeCategories.id 
            FROM financeCategories 
            WHERE financeCategories.name = 'Предварительная оплата услуг реализации'
        ))
    )
    
    LEFT JOIN finances f_payments ON (
        (c.id = f_payments.contragentId) AND 
        (f_payments.financeCategoryId = (
            SELECT financeCategories.id 
            FROM financeCategories 
            WHERE financeCategories.name = 'Оплата от реализаторов' and financeCategories.name='Сверху (оплата от реализаторов)'
        ))
    )
    
    LEFT JOIN debtTransfers dt ON (c.id = dt.kt)
    
GROUP BY 
    c.contragentName