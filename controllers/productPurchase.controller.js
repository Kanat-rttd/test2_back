const models = require('../models')
const sequelize = require('../config/db')

class ProductPurchaseController {
    async getAllPruchases(req, res, next) {
        try {
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
                    },
                    {
                        attributes: ['id', 'name'],
                        model: models.rawMaterials,
                    },
                ],
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

        await models.productPurchase.create({
            date: purchaseData.date,
            providerId: purchaseData.providerId,
            rawMaterialId: purchaseData.rawMaterialId,
            quantity: purchaseData.quantity,
            price: purchaseData.price,
            deliverySum: purchaseData.deliverySum,
            totalSum: totalSum,
            status: purchaseData.status.label,
        })

        return res.status(200).send('Purchase Created')
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
}

module.exports = new ProductPurchaseController()
