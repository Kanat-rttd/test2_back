const models = require('../models')

class FinanceController {
    async getAll(req, res, next) {
        try {
            let { sortOrder } = req.query
            console.log(sortOrder)

            sortOrder = sortOrder || ''

            const order = sortOrder === 'desc' ? [['date', 'DESC']] : [['date', 'ASC']]

            const data = await models.finance.findAll({
                attributes: ['id', 'amount', 'date', 'category', 'clientId', 'account', 'comment'],
                order: order,
                include: [
                    {
                        model: models.financeCategories,
                        attributes: ['id', 'name', 'type'],
                    },
                ],
            })

            // console.log(data)
            return res.json(data)
        } catch (error) {
            return next(error)
        }
    }

    async createArrival(req, res, next) {
        const { account, amount, financeCategoryId, clientId, comment, date } = req.body

        await models.finance.create({
            account,
            amount,
            financeCategoryId,
            clientId,
            comment,
            date,
        })

        return res.status(200).send('Arrival Created')
    }

    async createConsumption(req, res, next) {
        const { account, amount, financeCategoryId, clientId, comment, date } = req.body

        await models.finance.create({
            account,
            amount: amount * -1,
            financeCategoryId,
            clientId,
            comment,
            date,
        })

        return res.status(200).send('Consumption Created')
    }

    async createTransfer(req, res, next) {
        const { amount, comment, date, fromAccount, toAccount } = req.body

        await models.finance.create({
            account: fromAccount,
            amount: amount * -1,
            financeCategoryId: 5,
            clientId: null,
            comment,
            date,
        })

        await models.finance.create({
            account: toAccount,
            amount: amount,
            financeCategoryId: 5,
            clientId: null,
            comment,
            date,
        })

        return res.status(200).send('Transfer Created')
    }
}

module.exports = new FinanceController()
