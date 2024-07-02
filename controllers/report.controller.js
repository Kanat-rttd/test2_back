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
        const { Op, fn, col, literal } = require('sequelize')

        const startDate = '2024-06-29'
        const endDate = '2024-07-04'

        const result = await models.goodsCategories.findAll({
            include: [
                {
                    model: models.productPurchase,
                    attributes: [],
                    where: { date: { [Op.lte]: startDate } },
                    required: false,
                    duplicating: false,
                    as: 'pp',
                    attributes: [[fn('SUM', col('pp.quantity')), 'totalQuantity']],
                    group: ['goodsCategoryId'],
                },
                {
                    model: models.bakingDetails,
                    attributes: [],
                    where: { createdAt: { [Op.lte]: startDate } },
                    required: false,
                    duplicating: false,
                    as: 'bd',
                    attributes: [[fn('SUM', col('bd.quantity')), 'bakingQuantity']],
                    group: ['goodsCategoryId'],
                },
                {
                    model: models.bakingDetails,
                    attributes: [],
                    where: {
                        createdAt: {
                            [Op.gt]: startDate,
                            [Op.lte]: endDate,
                        },
                    },
                    required: false,
                    duplicating: false,
                    as: 'bd_expenses',
                    attributes: [[fn('SUM', col('bd_expenses.quantity')), 'bakingExpenses']],
                    group: ['goodsCategoryId'],
                },
                {
                    model: models.productPurchase,
                    attributes: [],
                    where: {
                        date: {
                            [Op.gt]: startDate,
                            [Op.lte]: endDate,
                        },
                    },
                    required: false,
                    duplicating: false,
                    as: 'pp_expenses',
                    attributes: [[fn('SUM', col('pp_expenses.quantity')), 'purchaseExpenses']],
                    group: ['goodsCategoryId'],
                },
                {
                    model: models.adjustments,
                    attributes: [],
                    where: { createdAt: { [Op.lte]: startDate } },
                    required: false,
                    duplicating: false,
                    as: 'ad',
                    attributes: [[fn('SUM', col('ad.quantity')), 'adjustment']],
                    group: ['goodsCategoryId'],
                },
                {
                    model: models.adjustments,
                    attributes: [],
                    where: {
                        createdAt: {
                            [Op.gt]: startDate,
                            [Op.lte]: endDate,
                        },
                    },
                    required: false,
                    duplicating: false,
                    as: 'period_ad',
                    attributes: [[fn('SUM', col('period_ad.quantity')), 'periodAdjustment']],
                    group: ['goodsCategoryId'],
                },
            ],
            group: [
                'pp.id',
                'bd.id',
                'bd_expenses.id',
                'pp_expenses.id',
                'ad.id',
                'period_ad.id',
                'goodsCategories.id',
                'pp.goodsCategoryId',
                'bd.goodsCategoryId',
                'bd_expenses.goodsCategoryId',
                'pp_expenses.goodsCategoryId',
                'ad.goodsCategoryId',
                'period_ad.goodsCategoryId',
            ],
        })

        return res.json(result)
    }

    // async getRemainRawMaterials(req, res, next) {
    //     const startDate = '2024-06-29'
    //     const endDate = '2024-07-04'

    //     const sqlQuery = `
    //         SELECT
    //             gc.id,
    //             gc.category,
    //             gc.unitOfMeasure,
    //             ( ( COALESCE(pp.totalQuantity, 0) - COALESCE(bd.bakingQuantity, 0) ) + COALESCE(ad.adjustment, 0) ) AS ОстатокНаНачало,
    //             COALESCE(bd_expenses.bakingExpenses, 0) AS Расход,
    //             COALESCE(pp_expenses.purchaseExpenses, 0) AS Приход,
    //             COALESCE(period_ad.periodAdjustment, 0) AS КорректировкаЗаПериод,
    //             ( ( ( COALESCE(pp.totalQuantity, 0) - COALESCE(bd.bakingQuantity, 0) ) + COALESCE(ad.adjustment, 0) ) + COALESCE(pp_expenses.purchaseExpenses, 0) - COALESCE(bd_expenses.bakingExpenses, 0) + COALESCE(period_ad.periodAdjustment, 0) ) AS ОстатокНаКонец
    //         FROM
    //             goodsCategories gc
    //         LEFT JOIN (
    //             SELECT
    //                 productPurchases.goodsCategoryId AS goodsCategoryId,
    //                 SUM(CASE WHEN productPurchases.date <= '${startDate}' THEN productPurchases.quantity ELSE 0 END) AS totalQuantity
    //             FROM
    //                 productPurchases
    //             GROUP BY
    //                 productPurchases.goodsCategoryId
    //         ) pp ON gc.id = pp.goodsCategoryId
    //         LEFT JOIN (
    //             SELECT
    //                 bakingDetails.goodsCategoryId AS goodsCategoryId,
    //                 SUM(CASE WHEN bakingDetails.createdAt <= '${startDate}' THEN bakingDetails.quantity ELSE 0 END) AS bakingQuantity
    //             FROM
    //                 bakingDetails
    //             GROUP BY
    //                 bakingDetails.goodsCategoryId
    //         ) bd ON gc.id = bd.goodsCategoryId
    //         LEFT JOIN (
    //             SELECT
    //                 bakingDetails.goodsCategoryId AS goodsCategoryId,
    //                 SUM(CASE WHEN bakingDetails.createdAt > '${startDate}' AND bakingDetails.createdAt <= '${endDate}' THEN bakingDetails.quantity ELSE 0 END) AS bakingExpenses
    //             FROM
    //                 bakingDetails
    //             GROUP BY
    //                 bakingDetails.goodsCategoryId
    //         ) bd_expenses ON gc.id = bd_expenses.goodsCategoryId
    //         LEFT JOIN (
    //             SELECT
    //                 productPurchases.goodsCategoryId AS goodsCategoryId,
    //                 SUM(CASE WHEN productPurchases.date > '${startDate}' AND productPurchases.date <= '${endDate}' THEN productPurchases.quantity ELSE 0 END) AS purchaseExpenses
    //             FROM
    //                 productPurchases
    //             GROUP BY
    //                 productPurchases.goodsCategoryId
    //         ) pp_expenses ON gc.id = pp_expenses.goodsCategoryId
    //         LEFT JOIN (
    //             SELECT
    //                 adjustments.goodsCategoryId AS goodsCategoryId,
    //                 SUM(CASE WHEN adjustments.createdAt <= '${startDate}' THEN adjustments.quantity ELSE 0 END) AS adjustment
    //             FROM
    //                 adjustments
    //             GROUP BY
    //                 adjustments.goodsCategoryId
    //         ) ad ON gc.id = ad.goodsCategoryId
    //         LEFT JOIN (
    //             SELECT
    //                 adjustments.goodsCategoryId AS goodsCategoryId,
    //                 SUM(CASE WHEN adjustments.createdAt > '${startDate}' AND adjustments.createdAt <= '${endDate}' THEN adjustments.quantity ELSE 0 END) AS periodAdjustment
    //             FROM
    //                 adjustments
    //             GROUP BY
    //                 adjustments.goodsCategoryId
    //         ) period_ad ON gc.id = period_ad.goodsCategoryId;
    //     `

    //     try {
    //         const result = await sequelize.query(sqlQuery, { type: sequelize.QueryTypes.SELECT })
    //         return res.json(result)
    //     } catch (error) {
    //         return next(error)
    //     }
    // }
}

module.exports = new ReportController()
