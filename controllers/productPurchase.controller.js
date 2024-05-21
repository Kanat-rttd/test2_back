const models = require('../models')
const sequelize = require('../config/db')
const { Op,col } = require('sequelize')

class ProductPurchaseController {
    async getAllPruchases(req, res, next) {
        try {
            const { startDate, endDate, providerId, rawMaterialId, paymentStatus } = req.query
            console.log('Received query parameters:', startDate, endDate)

            const dateFilterOptions = {}
            const providerFilterOptions = {}
            const rawMaterialFilterOptions = {}

            if (startDate && endDate) {
                dateFilterOptions.createdAt = {
                    [Op.between]: [startDate, endDate],
                }
            }

            if (providerId) {
                providerFilterOptions.id = providerId
            }

            if (rawMaterialId) {
                rawMaterialFilterOptions.id = rawMaterialId
            }

            if (paymentStatus) {
                dateFilterOptions.status = paymentStatus
            }

            const data = await models.productPurchase.findAll({
                attributes: [
                    'id',
                    'date',
                    'providerId',
                    'rawMaterialId',
                    'quantity',
                    'price',
                    'deliverySum',
                    'totalSum',
                    'status',
                ],
                include: [
                    {
                        attributes: ['id', 'name'],
                        model: models.providers,
                        where: providerFilterOptions,
                        // required: true,
                    },
                    {
                        attributes: ['id', [col('good'),'name']],
                        model: models.providerGoods,
                        where: rawMaterialFilterOptions,
                        // required: true,
                    },
                ],
                where: {
                    isDeleted: {
                        [Op.ne]: 1,
                    },
                    ...dateFilterOptions,
                },
            })

            let totalQuantity = 0
            let totalSum = 0
            let totalDeliverySum = 0
            data.forEach((purchase) => {
                totalQuantity += purchase.quantity
                totalSum += purchase.totalSum
                totalDeliverySum += purchase.deliverySum
            })

            const responseData = {
                purchases: data,
                totalQuantity: totalQuantity,
                totalSum: totalSum,
                totalDeliverySum: totalDeliverySum,
            }

            return res.json(responseData)
        } catch (error) {
            return next(error)
        }
    }

    async createPurchase(req, res, next) {
        const purchaseData = req.body

        // console.log(purchaseData)

        let totalSum = Number(purchaseData.quantity) * Number(purchaseData.price) + Number(purchaseData.deliverySum)

        const createdPurchase = await models.productPurchase.create({
            ...purchaseData,
            totalSum: totalSum,
            status: purchaseData.status.label,
        })

        return res.status(200).json({ message: 'Закупка успешно создана', data: createdPurchase })
    }

    async updatePurchase(req, res, next) {
        const { id } = req.params

        const purchaseData = req.body

        let totalSum = Number(purchaseData.quantity) * Number(purchaseData.price) + Number(purchaseData.deliverySum)

        const updateObj = {
            quantity: purchaseData.quantity,
            price: purchaseData.price,
            deliverySum: purchaseData.deliverySum,
            date: purchaseData.date,
            providerId: purchaseData.providerId,
            rawMaterialId: purchaseData.rawMaterialId,
            status: purchaseData.status.label,
            totalSum: totalSum,
        }

        await models.productPurchase.update(updateObj, {
            where: {
                id,
            },
        })

        return res.status(200).send('Purchase updated')
    }

    async deletePurchase(req, res) {
        const { id } = req.params

        const deletedPurchase = await models.productPurchase.update(
            { isDeleted: true },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).json({ message: 'Закупка успешно удалена', data: deletedPurchase })
    }

    async getDebtPurchases(req, res, next) {
        const { providerId } = req.query
        console.log('Received query parameters:', providerId)

        const filterOptions = {}

        if (providerId) {
            filterOptions.id = providerId
        }

        const debts = await models.productPurchase.findAll({
            attributes: [[sequelize.fn('SUM', sequelize.col('totalSum')), 'totalDebt']],
            where: { status: 'Не оплачено', ...filterOptions },
        })

        const data = await models.productPurchase.findAll({
            attributes: [[sequelize.fn('SUM', sequelize.col('totalSum')), 'totalDebt'], 'providerId'],
            include: [
                {
                    attributes: ['id', 'name'],
                    model: models.providers,
                    where: filterOptions,
                },
            ],
            where: { status: 'Не оплачено' },
            group: ['providerId'],
        })

        const totalDebt = debts.length > 0 ? debts[0].dataValues.totalDebt : 0

        return res.json({ totalDebt, data })
    }
}

module.exports = new ProductPurchaseController()
