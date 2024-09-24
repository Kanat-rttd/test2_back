const models = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../config/db')

class FinanceController {
    async getAll(req, res, next) {
        try {
            const { startDate, endDate, categoryId, accountName, sortOrder = '' } = req.query

            const whereClauses = {
                where: {
                    isDeleted: { [Op.ne]: 1 },
                    ...(startDate &&
                        endDate && {
                            date: {
                                [Op.between]: [
                                    new Date(startDate).setHours(0, 0, 0, 0),
                                    new Date(endDate).setHours(23, 59, 59, 999),
                                ],
                            },
                        }),
                    ...(categoryId && { '$financeCategory.id$': { [Op.eq]: categoryId } }),
                    ...(accountName && { '$financeAccount.name$': { [Op.eq]: accountName } }),
                },
            }

            const order = sortOrder === 'desc' ? [['date', 'DESC']] : [['date', 'ASC']]

            const data = await models.finance.findAll({
                attributes: ['id', 'amount', 'date', 'financeCategoryId', 'contragentId', 'comment'],
                order: order,
                include: [
                    {
                        model: models.financeCategories,
                        attributes: ['id', 'name', 'type'],
                    },
                    {
                        model: models.financeAccount,
                        attributes: ['id', 'name'],
                    },
                ],
                ...whereClauses,
            })

            return res.json(data)
        } catch (error) {
            return next(error)
        }
    }

    async createArrival(req, res, next) {
        const { data } = req.body

        const contragentInfo = await models.contragent.findOne({
            where: { id: data.contragentId },
            include: [
                {
                    model: models.overPrices,
                },
            ],
        })

        const existingDetail = await models.overPrices.findOne({
            where: { contragentId: data.contragentId },
        })

        if (contragentInfo.contragentTypeId == 1 && contragentInfo.overPrices[0].price) {
            if (existingDetail) {
                await existingDetail.update({
                    amount: existingDetail.amount + contragentInfo.overPrices[0].price,
                })
            } else {
                await models.overPrices.create({
                    contragentId: data.contragentId,
                    amount: contragentInfo.overPrices[0].price,
                })
            }
        } else {
            console.log('Отсутствует сверху для данного реализатора')
        }

        await models.finance.create({
            financeAccountId: data.financeAccountId,
            amount: data.amount,
            financeCategoryId: data.financeCategoryId,
            contragentId: data.contragentId,
            comment: data.comment,
            date: data.date,
            invoiceNumber: data.invoiceNumber,
        })

        return res.status(200).send('Arrival Created')
    }

    async createConsumption(req, res, next) {
        const bodyData = req.body

        await models.finance.create({
            financeAccountId: bodyData.data.financeAccountId,
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
            financeAccountId: bodyData.data.fromAccountId,
            amount: bodyData.data.amount * -1,
            financeCategoryId: 6,
            contragentId: null,
            comment: bodyData.data.comment,
            date: bodyData.data.date,
        })

        await models.finance.create({
            financeAccountId: bodyData.data.toAccountId,
            amount: bodyData.data.amount,
            financeCategoryId: 6,
            contragentId: null,
            comment: bodyData.data.comment,
            date: bodyData.data.date,
        })

        return res.status(200).json({ message: 'Перевод подтвержден' })
    }

    async getReportData(req, res, next) {
        const { startDate, endDate } = req.query

        const datesClauses = {
            ...(startDate &&
                endDate && {
                    date: {
                        [Op.between]: [
                            new Date(startDate).setHours(0, 0, 0, 0),
                            new Date(endDate).setHours(23, 59, 59, 999),
                        ],
                    },
                    isDeleted: { [Op.eq]: false },
                }),
        }

        const financesPromise = models.finance.findAll({
            attributes: ['amount', 'financeCategoryId', 'comment', 'date'],
            include: [{ model: models.financeCategories, attributes: ['id', 'name', 'type'] }],
            where: {
                ...datesClauses,
                isDeleted: { [Op.eq]: false },
            },
        })

        const financesBeforePromise = models.finance.findAll({
            attributes: ['amount', 'financeCategoryId', 'comment', 'date'],
            where: {
                date: {
                    [Op.lte]: new Date(startDate).setHours(0, 0, 0, 0),
                },
                isDeleted: { [Op.eq]: false },
            },
        })

        const purchasesPromise = models.productPurchase.findAll({
            attributes: ['totalSum', 'date', 'status'],
            where: {
                ...datesClauses,
                status: { [Op.eq]: 'Не оплачено' },
                isDeleted: { [Op.eq]: false },
            },
        })

        const purchasesBeforePromise = models.productPurchase.findAll({
            attributes: ['totalSum', 'date', 'status'],
            where: {
                date: { [Op.lte]: new Date(startDate).setHours(0, 0, 0, 0) },
            },
        })

        const [finances, financesBefore, purchases, purchasesBefore] = await Promise.all([
            financesPromise,
            financesBeforePromise,
            purchasesPromise,
            purchasesBeforePromise,
        ])

        const initial =
            purchasesBefore.reduce((acc, cur) => acc + Number(cur.totalSum), 0) +
            financesBefore.reduce((acc, cur) => acc + Number(cur.amount), 0)

        const operational = finances
            .filter(({ financeCategoryId }) => financeCategoryId !== 9)
            .reduce((acc, { amount }) => acc + Number(amount), 0)

        const nonPaidPurchases = purchases.reduce((acc, { totalSum }) => acc + Number(totalSum), 0)

        const debtPayments = finances
            .filter(({ financeCategoryId }) => financeCategoryId === 9)
            .reduce((acc, { amount }) => acc + Number(amount), 0)

        console.log('nonPaidPurchases', nonPaidPurchases)
        console.log('debtPayments', debtPayments)

        const financial = nonPaidPurchases - debtPayments

        const balance = finances
            .filter(({ financeCategory }) => financeCategory.type === 'Перевод')
            .reduce((acc, { amount }) => acc + Number(amount), 0)

        return res.json({
            initial,
            operational,
            financial,
            balance,
            total: initial + operational + financial,
        })
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

            return res.json(financeAmounts)
        } catch (error) {
            next(error)
        }
    }

    async deleteFinance(req, res) {
        const {id} = req.params
        await models.finance.update(
            {
                isDeleted: true,
            },
            {where: {id: Number(id)}},
        )

        return res.status(200).json({message: 'Финанс успешно удален'})
    }
}

module.exports = new FinanceController()
