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
        const { name, place, startDate, endDate } = req.query

        const filterOptions = {}

        if (name) {
            filterOptions.providerGoodId = name
        }

        if (place) {
            filterOptions.place = place
        }

        if (startDate && endDate) {
            filterOptions.createdAt = {
                [Op.between]: [
                    new Date(startDate).setHours(0, 0, 0, 0),
                    new Date(endDate).setHours(23, 59, 59, 999),
                ],
            }
        }

        const data = await models.inventorizations.findAll({
            attributes: [
                'id',
                'goods',
                'unitOfMeasure',
                'accountingQuantity',
                'factQuantity',
                'adjustments',
                'discrepancy',
            ],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
        })

        let totalRegister = 0
        let totalFact = 0
        let divergence = 0

        data.forEach((item) => {
            console.log(item.Debit)
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
    }
}

module.exports = new ReportController()
