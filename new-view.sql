with
    `preprocessed` as (
        select
            `gd`.`contragentId` AS `contragentId`,
            (
                case
                    when (hour (`gd`.`createdAt`) < 14) then cast(`gd`.`createdAt` as date)
                    else cast((`gd`.`createdAt` + interval 1 day) as date)
                end
            ) AS `adjustedDate`,
            sum((`gdd`.`quantity` * `gdd`.`price`)) AS `Sales`,
            `op`.`price` AS `Overhead`
        from
            (
                (
                    `goodsDispatches` `gd`
                    join `goodsDispatchDetails` `gdd` on ((`gd`.`id` = `gdd`.`goodsDispatchId`))
                )
                left join `overPrices` `op` on (
                    (
                        (`gd`.`contragentId` = `op`.`contragentId`)
                        and (year (`gd`.`createdAt`) = `op`.`year`)
                        and (month (`gd`.`createdAt`) = `op`.`month`)
                    )
                )
            )
        where
            (`gd`.`dispatch` = 0)
        group by
            `gd`.`contragentId`,
            `adjustedDate`,
            `op`.`price`
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
            (`gd`.`dispatch` = 1)
        group by
            `gd`.`contragentId`,
            `adjustedDate`
    )
select
    `c`.`contragentName` AS `ClientName`,
    `preprocessed`.`adjustedDate` AS `adjustedDate`,
    coalesce(sum(`preprocessed`.`Sales`), 0) AS `Sales`,
    coalesce(sum(`gdd_returns`.`Sales`), 0) AS `Returns`,
    coalesce(sum(`preprocessed`.`Overhead`), 0) AS `Overhead`,
    coalesce(sum(`f_expenses`.`amount`), 0) AS `Expenses`,
    coalesce(sum(`f_payments`.`amount`), 0) AS `Payments`,
    (
        coalesce(sum(`kt`.`amount`), 0) - coalesce(sum(`dt`.`amount`), 0)
    ) AS `Credit`,
    (
        (
            (
                (
                    (
                        (
                            coalesce(sum(`preprocessed`.`Sales`), 0) - coalesce(sum(`gdd_returns`.`Sales`), 0)
                        ) + coalesce(sum(`preprocessed`.`Overhead`), 0)
                    ) - abs(coalesce(sum(`f_expenses`.`amount`), 0))
                ) - coalesce(sum(`f_payments`.`amount`), 0)
            ) - coalesce(sum(`kt`.`amount`), 0)
        ) + coalesce(sum(`dt`.`amount`), 0)
    ) AS `Debt`
from
    (
        (
            (
                (
                    (
                        (
                            `contragents` `c`
                            left join `preprocessed` on ((`c`.`id` = `preprocessed`.`contragentId`))
                        )
                        left join `gdd_returns` on (
                            (
                                (`c`.`id` = `gdd_returns`.`contragentId`)
                                and (
                                    `preprocessed`.`adjustedDate` = `gdd_returns`.`adjustedDate`
                                )
                            )
                        )
                    )
                    left join `finances` `f_expenses` on (
                        (
                            (`c`.`id` = `f_expenses`.`contragentId`)
                            and (
                                `f_expenses`.`financeCategoryId` = (
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
                        )
                    )
                )
                left join `finances` `f_payments` on (
                    (
                        (`c`.`id` = `f_payments`.`contragentId`)
                        and `f_payments`.`financeCategoryId` in (
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
                    )
                )
            )
            left join `debtTransfers` `kt` on ((`c`.`id` = `kt`.`kt`))
        )
        left join `debtTransfers` `dt` on ((`c`.`id` = `dt`.`dt`))
    )
where
    (`c`.`contragentTypeId` = 1)
group by
    `c`.`contragentName`,
    `preprocessed`.`adjustedDate`