const models = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../config/db')

class FinanceController {
    async getAll(req, res, next) {
        try {
            const { startDate, endDate } = req.query

            const filterOptions = {}

            if (startDate && endDate) {
                filterOptions.date = {
                    [Op.between]: [
                        new Date(startDate).setHours(0, 0, 0, 0),
                        new Date(endDate).setHours(23, 59, 59, 999),
                    ],
                }
            }

            let { sortOrder } = req.query

            sortOrder = sortOrder || ''

            const order = sortOrder === 'desc' ? [['date', 'DESC']] : [['date', 'ASC']]

            const data = await models.finance.findAll({
                attributes: ['id', 'amount', 'date', 'financeCategoryId', 'contragentId', 'account', 'comment'],
                order: order,
                include: [
                    {
                        model: models.financeCategories,
                        attributes: ['id', 'name', 'type'],
                    },
                ],
                where: {
                    // isDeleted: {
                    //     [Op.ne]: 1,
                    // },
                    ...filterOptions,
                },
            })

            // console.log(data)
            return res.json(data)
        } catch (error) {
            return next(error)
        }
    }

    async createArrival(req, res, next) {
        const bodyData = req.body
        console.log(bodyData)

        await models.finance.create({
            account: bodyData.data.account,
            amount: bodyData.data.amount,
            financeCategoryId: bodyData.data.financeCategoryId,
            contragentId: bodyData.data.contragentId,
            comment: bodyData.data.comment,
            date: bodyData.data.date,
            invoiceNumber: bodyData.invoiceNumber,
        })

        return res.status(200).send('Arrival Created')
    }

    async createConsumption(req, res, next) {
        const bodyData = req.body

        await models.finance.create({
            account: bodyData.data.account,
            amount: bodyData.data.amount * -1,
            financeCategoryId: bodyData.data.financeCategoryId,
            contragentId: bodyData.data.contragentId,
            comment: bodyData.data.comment,
            date: bodyData.data.date,
        })

        return res.status(200).send('Consumption Created')
    }

    async createTransfer(req, res, next) {
        const bodyData = req.body

        await models.finance.create({
            account: bodyData.data.fromAccount,
            amount: bodyData.data.amount * -1,
            financeCategoryId: 6,
            contragentId: null,
            comment: bodyData.data.comment,
            date: bodyData.data.date,
        })

        await models.finance.create({
            account: bodyData.data.toAccount,
            amount: bodyData.data.amount,
            financeCategoryId: 6,
            contragentId: null,
            comment: bodyData.data.comment,
            date: bodyData.data.date,
        })

        return res.status(200).json({ message: 'Перевод подтвержден' })
    }

    async getReportData(req, res, next) {
        const rawData = await models.finance.findAll({
            attributes: ['amount', 'financeCategoryId', 'comment'],
            include: [{ model: models.financeCategories, attributes: ['name', 'type'] }],
        })

        // Инициализация общей суммы
        let initial = 0

        // Инициализация объекта данных
        const data = {
            initial: 0,
            defaultData: [],
            data: {
                operational: { total: 0, data: [] },
                financial: { total: 0, data: [] },
            },
            balance: 0,
        }

        // Обработка данных из базы
        rawData.forEach(({ amount, financeCategory }) => {
            const { type, name } = financeCategory
            const total = Number(amount)

            // Обновление общей суммы
            initial += total

            // Определение категории и добавление данных в соответствующий раздел
            if (type === 'Операционный') {
                data.data.operational.total += total
                data.data.operational.data.push({ name, total })
            } else if (type === 'Финансовый') {
                data.data.financial.total += total
                data.data.financial.data.push({ name, total })
            } else if (type === 'Обычный') {
                data.defaultData.push({ name, total })
            }
        })

        // Вычисление суммы для баланса (Переводы)
        data.balance = rawData
            .filter(({ financeCategory }) => financeCategory.type === 'Перевод')
            .reduce((acc, { amount }) => acc + Number(amount), 0)

        // Выставление общей суммы
        data.initial = initial

        // Возвращение сформированных данных
        return res.json(data)
    }

    async getFinanceAmountByInvoiceNumber(req, res, next) {
        const { invoiceNumber } = req.params

        try {
            const result = await models.finance.findOne({
                attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']],
                where: { invoiceNumber: invoiceNumber },
            })

            const totalAmount = result.dataValues.totalAmount || 0

            return res.json({ totalAmount })
        } catch (error) {
            next(error)
        }
    }

    async getAllTotalsWithInvoiceNumbers(req, res, next) {
        try {
            const results = await models.finance.findAll({
                attributes: ['invoiceNumber', [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']],
                where: { invoiceNumber: { [Op.ne]: null } },
                group: ['invoiceNumber'],
            })

            const financeAmounts = results.map((result) => ({
                invoiceNumber: result.invoiceNumber,
                totalAmount: result.dataValues.totalAmount || 0,
            }))

            console.log(financeAmounts)

            return res.json(financeAmounts)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new FinanceController()
