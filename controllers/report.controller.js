const models = require('../models')
const { Op } = require('sequelize')

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
                attributes: ['id', 'category', 'accQuantity', 'factQuantity', 'adjusment', 'difference'],
                where: {
                    ...filterOptions,
                },
            })

            let totalRegister = 0
            let totalFact = 0
            let divergence = 0

            data.forEach((item) => {
                totalRegister += Number(item.accountingQuantity)
                totalFact += Number(item.factQuantity)
                divergence += Number(item.discrepancy)
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
}

module.exports = new ReportController()
