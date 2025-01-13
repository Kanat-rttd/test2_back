-- Иногда в gdd price записывается неактуальная информация
-- Этот скрипт обновляет цену выдачи если существует индивидуальная цена для реализатора
UPDATE
    goodsDispatchDetails gdd
    JOIN goodsDispatches gd ON gdd.goodsDispatchId = gd.id
    JOIN contragents c ON gd.contragentId = c.id
    JOIN clients cl ON c.mainId = cl.id
    JOIN individualPrices ip ON gdd.productId = ip.productId
SET
    gdd.price = ip.price
WHERE
    c.contragentTypeId = 1
    AND gdd.createdAt > ip.createdAt
    AND ip.clientId = cl.id;