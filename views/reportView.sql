with gdd_dispatches as (
    select
        gd.contragentId AS contragentId,
        if(
            (hour(gd.createdAt) < 14),
            cast(gd.createdAt as date),
            cast((gd.createdAt + interval 1 day) as date)
        ) AS adjustedDate,
        sum((gdd.quantity * gdd.price)) AS Sales,
        max(op.price) AS Overhead
    from
        (
            (
                goodsDispatches gd
                join goodsDispatchDetails gdd on((gd.id = gdd.goodsDispatchId))
            )
            left join overPrices op on(
                (
                    (gd.contragentId = op.contragentId)
                    and (year(gd.createdAt) = op.year)
                    and (month(gd.createdAt) = op.month)
                )
            )
        )
    where
        (
            (gd.dispatch = 0)
            and (gd.isDeleted = 0)
        )
    group by
        gd.contragentId,
        adjustedDate
),
gdd_returns as (
    select
        gd.contragentId AS contragentId,
        if(
            (hour(gd.createdAt) < 14),
            cast(gd.createdAt as date),
            cast((gd.createdAt + interval 1 day) as date)
        ) AS adjustedDate,
        sum((gdd.quantity * gdd.price)) AS Returns
    from
        (
            goodsDispatches gd
            join goodsDispatchDetails gdd on((gd.id = gdd.goodsDispatchId))
        )
    where
        (
            (gd.dispatch = 1)
            and (gd.isDeleted = 0)
        )
    group by
        gd.contragentId,
        adjustedDate
),
finances_payments as (
    select
        f.contragentId AS contragentId,
        if(
            (hour(f.createdAt) < 14),
            cast(f.createdAt as date),
            cast((f.createdAt + interval 1 day) as date)
        ) AS adjustedDate,
        sum(f.amount) AS Payments
    from
        (
            finances f
            join financeCategories fc on((f.financeCategoryId = fc.id))
        )
    where
        (
            fc.name in (
                'Оплата от реализаторов',
                'Сверху (оплата от реализаторов)'
            )
        )
    group by
        f.contragentId,
        adjustedDate
),
debtTransfers_kt as (
    select
        dt.kt AS contragentId,
        if(
            (hour(dt.createdAt) < 14),
            cast(dt.createdAt as date),
            cast((dt.createdAt + interval 1 day) as date)
        ) AS adjustedDate,
        sum(dt.amount) AS Credit
    from
        debtTransfers dt
    group by
        dt.kt,
        adjustedDate
),
debtTransfers_dt as (
    select
        dt.dt AS contragentId,
        if(
            (hour(dt.createdAt) < 14),
            cast(dt.createdAt as date),
            cast((dt.createdAt + interval 1 day) as date)
        ) AS adjustedDate,
        sum(dt.amount) AS Debit
    from
        debtTransfers dt
    group by
        dt.dt,
        adjustedDate
)
select
    c.id AS ClientId,
    c.contragentName AS ClientName,
    main_dates.adjustedDate AS adjustedDate,
    coalesce(sum(gdd_dispatches.Sales), 0) AS Sales,
    coalesce(sum(gdd_returns.Returns), 0) AS Returns,
    coalesce(sum(gdd_dispatches.Overhead), 0) AS Overhead,
    coalesce(sum(finances_payments.Payments), 0) AS Payments,
    coalesce(sum(debtTransfers_kt.Credit), 0) AS Credit,
    coalesce(sum(debtTransfers_dt.Debit), 0) AS Debit,
    (
        (
            (
                (
                    (
                        coalesce(sum(gdd_dispatches.Sales), 0) - coalesce(sum(gdd_returns.Returns), 0)
                    ) + coalesce(sum(gdd_dispatches.Overhead), 0)
                ) - coalesce(sum(finances_payments.Payments), 0)
            ) - coalesce(sum(debtTransfers_kt.Credit), 0)
        ) + coalesce(sum(debtTransfers_dt.Debit), 0)
    ) AS Debt
from
    (
        (
            (
                (
                    (
                        (
                            (
                                contragents c
                                left join (
                                    select
                                        gdd_dispatches.contragentId AS contragentId,
                                        gdd_dispatches.adjustedDate AS adjustedDate
                                    from
                                        gdd_dispatches
                                    union
                                    select
                                        gdd_returns.contragentId AS contragentId,
                                        gdd_returns.adjustedDate AS adjustedDate
                                    from
                                        gdd_returns
                                    union
                                    select
                                        finances_payments.contragentId AS contragentId,
                                        finances_payments.adjustedDate AS adjustedDate
                                    from
                                        finances_payments
                                    union
                                    select
                                        debtTransfers_kt.contragentId AS contragentId,
                                        debtTransfers_kt.adjustedDate AS adjustedDate
                                    from
                                        debtTransfers_kt
                                    union
                                    select
                                        debtTransfers_dt.contragentId AS contragentId,
                                        debtTransfers_dt.adjustedDate AS adjustedDate
                                    from
                                        debtTransfers_dt
                                ) main_dates on((c.id = main_dates.contragentId))
                            )
                            left join gdd_dispatches on(
                                (
                                    (c.id = gdd_dispatches.contragentId)
                                    and (
                                        main_dates.adjustedDate = gdd_dispatches.adjustedDate
                                    )
                                )
                            )
                        )
                        left join gdd_returns on(
                            (
                                (c.id = gdd_returns.contragentId)
                                and (
                                    main_dates.adjustedDate = gdd_returns.adjustedDate
                                )
                            )
                        )
                    )
                )
                left join finances_payments on(
                    (
                        (c.id = finances_payments.contragentId)
                        and (
                            main_dates.adjustedDate = finances_payments.adjustedDate
                        )
                    )
                )
            )
            left join debtTransfers_kt on(
                (
                    (c.id = debtTransfers_kt.contragentId)
                    and (
                        main_dates.adjustedDate = debtTransfers_kt.adjustedDate
                    )
                )
            )
        )
        left join debtTransfers_dt on(
            (
                (c.id = debtTransfers_dt.contragentId)
                and (
                    main_dates.adjustedDate = debtTransfers_dt.adjustedDate
                )
            )
        )
    )
where
    (c.contragentTypeId = 1)
group by
    c.id,
    c.contragentName,
    main_dates.adjustedDate
order by
    c.id,
    c.contragentName,
    main_dates.adjustedDate