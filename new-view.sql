with
    `gdd_dispatches` as (
        select
            `gd`.`contragentId` AS `contragentId`,
            (
                case
                    when (hour (`gd`.`createdAt`) < 14) then cast(`gd`.`createdAt` as date)
                    else cast((`gd`.`createdAt` + interval 1 day) as date)
                end
            ) AS `adjustedDate`,
            sum((`gdd`.`quantity` * `gdd`.`price`)) AS `Sales`
        from
            (
                `goodsDispatches` `gd`
                join `goodsDispatchDetails` `gdd` on ((`gd`.`id` = `gdd`.`goodsDispatchId`))
            )
        where
            `gd`.`dispatch` = 0 -- Условие, указывающее на выдачу
        group by
            `gd`.`contragentId`,
            `adjustedDate`
    ),
    `gdd_returns` as (
        select
            `gd`.`contragentId` AS `contragentId`,
            (
                case
                    when (hour (`gd`.`createdAt`) < 14) then cast(`gd`.`createdAt` as date)
                    else cast((`gd`.`createdAt` + interval 1 day) as date)
                end
            ) AS `adjustedDate`,
            sum((`gdd`.`quantity` * `gdd`.`price`)) AS `Sales`
        from
            (
                `goodsDispatches` `gd`
                join `goodsDispatchDetails` `gdd` on ((`gd`.`id` = `gdd`.`goodsDispatchId`))
            )
        where
            `gd`.`dispatch` = 1 -- Условие, указывающее на возврат
        group by
            `gd`.`contragentId`,
            `adjustedDate`
    ),
    `gdd_dispatches_sums` as (
        select
            `gdd_dispatches`.`contragentId` AS `contragentId`,
            sum(`gdd_dispatches`.`Sales`) AS `TotalSales`
        from
            `gdd_dispatches`
        group by
            `gdd_dispatches`.`contragentId`
    ),
    `gdd_returns_sums` as (
        select
            `gdd_returns`.`contragentId` AS `contragentId`,
            sum(`gdd_returns`.`Sales`) AS `TotalReturns`
        from
            `gdd_returns`
        group by
            `gdd_returns`.`contragentId`
    ),
    `expenses_sums` as (
        select
            `finances`.`contragentId` AS `contragentId`,
            sum(`finances`.`amount`) AS `TotalExpenses`
        from
            `finances`
        where
            (
                `finances`.`financeCategoryId` = (
                    select
                        `financeCategories`.`id`
                    from
                        `financeCategories`
                    where
                        (
                            `financeCategories`.`name` = 'Предварительная оплата услуг реализации'
                        )
                )
            )
        group by
            `finances`.`contragentId`
    ),
    `payments_sums` as (
        select
            `finances`.`contragentId` AS `contragentId`,
            sum(`finances`.`amount`) AS `TotalPayments`
        from
            `finances`
        where
            `finances`.`financeCategoryId` in (
                select
                    `financeCategories`.`id`
                from
                    `financeCategories`
                where
                    (
                        `financeCategories`.`name` in (
                            'Оплата от реализаторов',
                            'Сверху (оплата от реализаторов)'
                        )
                    )
            )
        group by
            `finances`.`contragentId`
    ),
    `debt_transfers_sums` as (
        select
            `kt`.`kt` AS `contragentId`,
            sum(`kt`.`amount`) AS `TotalDebit`
        from
            `debtTransfers` `kt`
        group by
            `kt`.`kt`
    ),
    `credit_transfers_sums` as (
        select
            `dt`.`dt` AS `contragentId`,
            sum(`dt`.`amount`) AS `TotalCredit`
        from
            `debtTransfers` `dt`
        group by
            `dt`.`dt`
    ),
    `overhead_sums` as (
        select
            `op`.`contragentId` AS `contragentId`,
            coalesce(sum(`op`.`price`), 0) AS `Overhead`
        from
            `overPrices` `op`
        group by
            `op`.`contragentId`
    )
select
    `c`.`contragentName` AS `ClientName`,
    coalesce(`gdd_dispatches_sums`.`TotalSales`, 0) AS `Sales`,
    coalesce(`gdd_returns_sums`.`TotalReturns`, 0) AS `Returns`,
    coalesce(`overhead_sums`.`Overhead`, 0) AS `Overhead`,
    coalesce(`expenses_sums`.`TotalExpenses`, 0) AS `Expenses`,
    coalesce(`payments_sums`.`TotalPayments`, 0) AS `Payments`,
    coalesce(`debt_transfers_sums`.`TotalDebit`, 0) AS `Debit`,
    coalesce(`credit_transfers_sums`.`TotalCredit`, 0) AS `Credit`,
    (
        (
            (
                (
                    (
                        (
                            coalesce(`gdd_dispatches_sums`.`TotalSales`, 0) - coalesce(`gdd_returns_sums`.`TotalReturns`, 0)
                        ) + coalesce(`overhead_sums`.`Overhead`, 0)
                    ) - abs(coalesce(`expenses_sums`.`TotalExpenses`, 0))
                ) - coalesce(`payments_sums`.`TotalPayments`, 0)
            ) - coalesce(`debt_transfers_sums`.`TotalDebit`, 0)
        ) + coalesce(`credit_transfers_sums`.`TotalCredit`, 0)
    ) AS `Debt`
from
    (
        (
            (
                (
                    (
                        (
                            (
                                `contragents` `c`
                                left join `gdd_dispatches_sums` on ((`c`.`id` = `gdd_dispatches_sums`.`contragentId`))
                            )
                            left join `gdd_returns_sums` on ((`c`.`id` = `gdd_returns_sums`.`contragentId`))
                        )
                        left join `expenses_sums` on ((`c`.`id` = `expenses_sums`.`contragentId`))
                    )
                    left join `payments_sums` on ((`c`.`id` = `payments_sums`.`contragentId`))
                )
                left join `debt_transfers_sums` on ((`c`.`id` = `debt_transfers_sums`.`contragentId`))
            )
            left join `credit_transfers_sums` on (
                (`c`.`id` = `credit_transfers_sums`.`contragentId`)
            )
        )
        left join `overhead_sums` on ((`c`.`id` = `overhead_sums`.`contragentId`))
    )
where
    (`c`.`contragentTypeId` = 1)
group by
    `c`.`contragentName`,
    `gdd_dispatches_sums`.`TotalSales`,
    `gdd_returns_sums`.`TotalReturns`,
    `overhead_sums`.`Overhead`,
    `expenses_sums`.`TotalExpenses`,
    `payments_sums`.`TotalPayments`,
    `debt_transfers_sums`.`TotalDebit`,
    `credit_transfers_sums`.`TotalCredit`