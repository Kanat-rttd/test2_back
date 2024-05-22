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
            filterOptions.Date = {
                [Op.between]: [startDate, endDate],
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
}

module.exports = new ReportController()
