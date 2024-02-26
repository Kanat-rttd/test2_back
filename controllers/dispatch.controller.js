const { col } = require('../config/db')
const models = require('../models')
const { Op } = require('sequelize')
const AppError = require('../filters/appError')

class DispatchController {
    async createDispatch(req, res, next) {
        const dispatchData = req.body

        const dispatch = await models.goodsDispatch.create({
            userId: dispatch.clientId,
        })

        const dispatchDetails = dispatchData.products.map((sale) => ({
            goodsDispatchId: dispatch.id,
            productId: sale.productId,
            quantity: sale.quantity,
        }))

        await models.goodsDispatchDetails.bulkCreate(dispatchDetails)

        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно создан',
        })
    }
}

module.exports = new DispatchController()
