const models = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../config/db')

class ReportController {
    async breadViewReport(req, res, next) {
        const data = await models.breadReportView.findAll({
            attributes: ['Date', 'Products'],
        })

        return res.json(data)
    }

    async shiftTimeView(req, res, next) {
        const { startDate, endDate, personalName } = req.query
        console.log('Received query parameters:', startDate, endDate, personalName)

        const filterOptions = {}

        if (startDate && endDate) {
            filterOptions.createdAt = {
                [Op.between]: [new Date(startDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)],
            }
        }

        if (personalName) {
            filterOptions.personalName = personalName
        }

        const data = await models.shiftTimeView.findAll({
            attributes: ['Date', 'personalId', 'personalName', 'totalHours'],
            where: filterOptions,
        })

        return res.json(data)
    }

    async magazineDebtView(req, res, next) {
        const { MagazineName } = req.query

        console.log('magazineName ', MagazineName)

        const filterOptions = {}

        if (MagazineName) {
            filterOptions.MagazineName = MagazineName
        }

        const data = await models.magazineDebtView.findAll({
            attributes: ['MagazineName', 'Debit'],
            where: filterOptions,
        })

        let totalDebt = 0
        data.forEach((item) => {
            console.log(item.Debit)
            totalDebt += Number(item.Debit)
        })

        const responseData = {
            mainData: data,
            total: totalDebt,
        }

        return res.json(responseData)
    }

    async inventoryzationView(req, res, next) {
        try {
            const { productId } = req.query

            const filterOptions = {}

            if (productId) {
                filterOptions.id = productId
            }

            const data = await models.inventorizations.findAll({
                attributes: [
                    'id',
                    'category',
                    'unitOfMeasure',
                    'accQuantity',
                    'factQuantity',
                    'adjusment',
                    'difference',
                ],
                where: {
                    ...filterOptions,
                },
            })

            let totalRegister = 0
            let totalFact = 0
            let divergence = 0

            data.forEach((item) => {
                totalRegister += Number(item.accQuantity)
                totalFact += Number(item.factQuantity)
                divergence += Number(item.difference)
            })

            const responseData = {
                table: data,
                totalRegister,
                totalFact,
                divergence,
            }

            return res.json(responseData)
        } catch (error) {
            return next(error)
        }
    }

    async getSalesReportView(req, res, next) {
        const { startDate, endDate, contragentName } = req.query

        const filterOptions = {}

        if (startDate && endDate) {
            filterOptions.adjustedDate = {
                [Op.between]: [new Date(startDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)],
            }
        }

        if (contragentName) {
            filterOptions.contragentName = contragentName
        }

        const data = await models.salesReportView.findAll({
            attributes: ['name', 'SalesQuantity', 'adjustedDate', 'contragentName'],
            where: filterOptions,
        })

        const totals = {}
        const responseData = []

        data.forEach((item) => {
            if (!totals[item.name]) {
                totals[item.name] = 0
            }
            totals[item.name] += Number(item.SalesQuantity)
        })

        for (const name in totals) {
            responseData.push({ name, totalQuantity: totals[name] })
        }

        return res.json({ reportData: data, totals: responseData })
    }

    async getReconciliationReportView(req, res, next) {
        const { startDate, endDate, clientName } = req.query

        const filterOptions = {}

        if (startDate && endDate) {
            filterOptions.adjustedDate = {
                [Op.between]: [new Date(startDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)],
            }
        }

        if (clientName) {
            filterOptions.ClientName = clientName
        }

        const data = await models.reportView.findAll({
            attributes: [
                'ClientName',
                'adjustedDate',
                'Sales',
                'Returns',
                'Overhead',
                'Expenses',
                'Payments',
                'Credit',
                'Debt',
            ],
            where: filterOptions,
        })

        console.log(data)

        let totalSales = 0
        let totalReturns = 0
        let totalOverhead = 0
        let totalExpenses = 0
        let totalPayments = 0
        let totalCredit = 0
        let totalDebt = 0

        data.forEach((item) => {
            totalSales += Number(item.Sales)
            totalReturns += Number(item.Returns)
            totalOverhead += Number(item.Overhead)
            totalExpenses += Number(item.Expenses)
            totalPayments += Number(item.Payments)
            totalCredit += Number(item.Credit)
            totalDebt += Number(item.Debt)
        })

        const responseData = {
            reportData: data,
            totalSales,
            totalReturns,
            totalOverhead,
            totalExpenses,
            totalPayments,
            totalCredit,
            totalDebt,
        }

        return res.json(responseData)
    }

    async getRemainRawMaterials(req, res, next) {
        console.log('query ', req.query)

        const { startDate, endDate } = req.query

        const sqlQuery = `
            SELECT
                gc.id,
                gc.category,
                gc.unitOfMeasure,
                CAST(((COALESCE(pp.totalQuantity, 0) - COALESCE(bd.bakingQuantity, 0)) +
                 COALESCE(ad.adjustment, 0)) AS DECIMAL(7, 2)) AS openingStock,
                CAST(COALESCE(bd_expenses.bakingExpenses, 0) AS DECIMAL(7,2)) AS consumption,
                CAST(COALESCE(pp_expenses.purchaseExpenses, 0) AS DECIMAL(7,2)) AS incoming,
                COALESCE(period_ad.periodAdjustment, 0) AS adjustmentPeriod,
                CAST((((COALESCE(pp.totalQuantity, 0) - COALESCE(bd.bakingQuantity, 0)) + COALESCE(ad.adjustment, 0)) +
                 COALESCE(pp_expenses.purchaseExpenses, 0) - COALESCE(bd_expenses.bakingExpenses, 0) +
                 COALESCE(period_ad.periodAdjustment, 0)) AS DECIMAL(7,2)) AS closingStock
            FROM
                goodsCategories gc
                LEFT JOIN (
                    SELECT
                        productPurchases.goodsCategoryId AS goodsCategoryId,
                        SUM(CASE
                                WHEN productPurchases.date <= '${startDate}' THEN productPurchases.quantity
                                ELSE 0
                            END) AS totalQuantity
                    FROM
                        productPurchases
                    GROUP BY productPurchases.goodsCategoryId
                ) pp ON gc.id = pp.goodsCategoryId
                LEFT JOIN (
                    SELECT
                        bakingDetails.goodsCategoryId AS goodsCategoryId,
                        SUM(CASE
                                WHEN bakingDetails.createdAt <= '${startDate}' THEN bakingDetails.quantity
                                ELSE 0
                            END) AS bakingQuantity
                    FROM
                        bakingDetails
                    GROUP BY bakingDetails.goodsCategoryId
                ) bd ON gc.id = bd.goodsCategoryId
                LEFT JOIN (
                    SELECT
                        bakingDetails.goodsCategoryId AS goodsCategoryId,
                        SUM(CASE
                                WHEN bakingDetails.createdAt > '${startDate}' AND
                                     bakingDetails.createdAt <= '${endDate}' THEN bakingDetails.quantity
                                ELSE 0
                            END) AS bakingExpenses
                    FROM
                        bakingDetails
                    GROUP BY bakingDetails.goodsCategoryId
                ) bd_expenses ON gc.id = bd_expenses.goodsCategoryId
                LEFT JOIN (
                    SELECT
                        productPurchases.goodsCategoryId AS goodsCategoryId,
                        SUM(CASE
                                WHEN productPurchases.date > '${startDate}' AND productPurchases.date <= '${endDate}'
                                    THEN productPurchases.quantity
                                ELSE 0
                            END) AS purchaseExpenses
                    FROM
                        productPurchases
                    GROUP BY productPurchases.goodsCategoryId
                ) pp_expenses ON gc.id = pp_expenses.goodsCategoryId
                LEFT JOIN (
                    SELECT
                        adjustments.goodsCategoryId AS goodsCategoryId,
                        SUM(CASE
                                WHEN adjustments.createdAt <= '${startDate}' THEN adjustments.quantity
                                ELSE 0
                            END) AS adjustment
                    FROM
                        adjustments
                    GROUP BY adjustments.goodsCategoryId
                ) ad ON gc.id = ad.goodsCategoryId
                LEFT JOIN (
                    SELECT
                        adjustments.goodsCategoryId AS goodsCategoryId,
                        SUM(CASE
                                WHEN adjustments.createdAt > '${startDate}' AND adjustments.createdAt <= '${endDate}'
                                    THEN adjustments.quantity
                                ELSE 0
                            END) AS periodAdjustment
                    FROM
                        adjustments
                    GROUP BY adjustments.goodsCategoryId
                ) period_ad ON gc.id = period_ad.goodsCategoryId;
        `

        try {
            const result = await sequelize.query(sqlQuery, { type: sequelize.QueryTypes.SELECT })

            // Инициализация объекта для хранения тоталов
            const totals = {
                openingStock: 0,
                consumption: 0,
                incoming: 0,
                adjustmentPeriod: 0,
                closingStock: 0,
            }

            // Вычисление тоталов
            result.forEach((item) => {
                totals.openingStock += item.openingStock
                totals.consumption += item.consumption
                totals.incoming += parseFloat(item.incoming) // Преобразуем incoming в число, если это строка
                totals.adjustmentPeriod += item.adjustmentPeriod
                totals.closingStock += item.closingStock
            })

            return res.json({
                data: result,
                totals: totals,
            })
        } catch (error) {
            return next(error)
        }
    }

    async getRemainProducts(req, res, next) {
        console.log('query ', req.query)

        const { startDate, endDate } = req.query

        const sqlQuery = `
            SELECT
                p.id,
                p.name,
                COALESCE(b.totalQuantity, 0) AS production,
                COALESCE(gdd_dispatch.dispatch, 0) AS distribution,
                COALESCE(gdd_return.Vozvrat, 0) AS returns,
                (COALESCE(b.totalQuantity, 0) - COALESCE(gdd_dispatch.dispatch, 0) +
                 COALESCE(gdd_return.Vozvrat, 0)) AS openingStock,
                COALESCE(b_period.periodBaking, 0) AS productionPeriod,
                COALESCE(gdd_period_dispatch.periodDispatch, 0) AS distributionPeriod,
                COALESCE(b_defective.defectiveBaking, 0) AS defect,
                COALESCE(gdd_period_return.periodVozvrat, 0) AS returnsPeriod,
                (COALESCE(b.totalQuantity, 0) - COALESCE(gdd_dispatch.dispatch, 0) + COALESCE(gdd_return.Vozvrat, 0) +
                 COALESCE(b_period.periodBaking, 0) - COALESCE(gdd_period_dispatch.periodDispatch, 0) +
                 COALESCE(gdd_period_return.periodVozvrat, 0)) AS closingStock
            FROM
                products p
                LEFT JOIN (
                    SELECT
                        bakings.productId,
                        SUM(CASE
                                WHEN bakings.datetime <= '${startDate}' THEN bakings.output
                                ELSE 0
                            END) AS totalQuantity
                    FROM
                        bakings
                    GROUP BY bakings.productId
                ) b ON p.id = b.productId
                LEFT JOIN (
                    SELECT
                        gdd.productId,
                        SUM(CASE
                                WHEN g.dispatch = 0 AND gdd.createdAt <= '${startDate}' THEN gdd.quantity
                                ELSE 0
                            END) AS dispatch
                    FROM
                        goodsDispatchDetails gdd
                        JOIN goodsDispatches g ON gdd.goodsDispatchId = g.id
                    GROUP BY gdd.productId
                ) gdd_dispatch ON p.id = gdd_dispatch.productId
                LEFT JOIN (
                    SELECT
                        gdd.productId,
                        SUM(CASE
                                WHEN g.dispatch = 1 AND gdd.createdAt <= '${startDate}' THEN gdd.quantity
                                ELSE 0
                            END) AS Vozvrat
                    FROM
                        goodsDispatchDetails gdd
                        JOIN goodsDispatches g ON gdd.goodsDispatchId = g.id
                    GROUP BY gdd.productId
                ) gdd_return ON p.id = gdd_return.productId
                LEFT JOIN (
                    SELECT
                        bakings.productId,
                        SUM(CASE
                                WHEN bakings.datetime > '${startDate}' AND bakings.datetime <= '${endDate}'
                                    THEN bakings.output
                                ELSE 0
                            END) AS periodBaking
                    FROM
                        bakings
                    GROUP BY bakings.productId
                ) b_period ON p.id = b_period.productId
                LEFT JOIN (
                    SELECT
                        gdd.productId,
                        SUM(CASE
                                WHEN g.dispatch = 0 AND gdd.createdAt > '${startDate}' AND gdd.createdAt <= '${endDate}'
                                    THEN gdd.quantity
                                ELSE 0
                            END) AS periodDispatch
                    FROM
                        goodsDispatchDetails gdd
                        JOIN goodsDispatches g ON gdd.goodsDispatchId = g.id
                    GROUP BY gdd.productId
                ) gdd_period_dispatch ON p.id = gdd_period_dispatch.productId
                LEFT JOIN (
                    SELECT
                        bakings.productId,
                        SUM(CASE
                                WHEN bakings.datetime > '${startDate}' AND bakings.datetime <= '${endDate}'
                                    THEN bakings.defective
                                ELSE 0
                            END) AS defectiveBaking
                    FROM
                        bakings
                    GROUP BY bakings.productId
                ) b_defective ON p.id = b_defective.productId
                LEFT JOIN (
                    SELECT
                        gdd.productId,
                        SUM(CASE
                                WHEN g.dispatch = 1 AND gdd.createdAt > '${startDate}' AND gdd.createdAt <= '${endDate}'
                                    THEN gdd.quantity
                                ELSE 0
                            END) AS periodVozvrat
                    FROM
                        goodsDispatchDetails gdd
                        JOIN goodsDispatches g ON gdd.goodsDispatchId = g.id
                    GROUP BY gdd.productId
                ) gdd_period_return ON p.id = gdd_period_return.productId;
        `

        try {
            const result = await sequelize.query(sqlQuery, { type: sequelize.QueryTypes.SELECT })

            const totals = {
                production: 0,
                distribution: 0,
                returns: 0,
                openingStock: 0,
                productionPeriod: 0,
                distributionPeriod: 0,
                defect: 0,
                returnsPeriod: 0,
                closingStock: 0,
            }

            result.forEach((item) => {
                totals.production += parseFloat(item.production)
                totals.distribution += parseFloat(item.distribution)
                totals.returns += parseFloat(item.returns)
                totals.openingStock += parseFloat(item.openingStock)
                totals.productionPeriod += parseFloat(item.productionPeriod)
                totals.distributionPeriod += parseFloat(item.distributionPeriod)
                totals.defect += parseFloat(item.defect)
                totals.returnsPeriod += parseFloat(item.returnsPeriod)
                totals.closingStock += parseFloat(item.closingStock)
            })

            return res.json({
                data: result,
                totals: totals,
            })
        } catch (error) {
            return next(error)
        }
    }

    async getDebtPurchases(req, res, next) {
        const { providerId } = req.query
        console.log('Received query parameters:', providerId)

        const filterOptions = {}

        if (providerId) {
            filterOptions.id = providerId
        }

        const debts = await models.purchaseDebtView.findAll({
            attributes: [[sequelize.fn('SUM', sequelize.col('debt')), 'totals']],
            where: {
                status: {
                    [Op.eq]: sequelize.literal(`'Не оплачено' COLLATE utf8mb4_unicode_ci`),
                },
                ...filterOptions,
            },
        })

        const data = await models.purchaseDebtView.findAll({
            attributes: ['id', 'providerName', 'totalDebt', 'debt', 'status'],
            where: {
                status: {
                    [Op.eq]: sequelize.literal(`'Не оплачено' COLLATE utf8mb4_unicode_ci`),
                },
                ...filterOptions,
            },
        })

        const totalDebt = debts.length > 0 ? debts[0].dataValues.totals : 0

        return res.json({ totalDebt, data })
    }
}

module.exports = new ReportController()
