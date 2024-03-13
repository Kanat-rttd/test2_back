const { col } = require('../config/db')
const models = require('../models')
const { Op } = require('sequelize')
const AppError = require('../filters/appError')

class DispatchController {
    async getAll(req, res, next) {
        const dispatch = await models.goodsDispatch.findAll({
            attributes: ['id', 'clientId', 'createdAt', 'dispatch'],
            include: [
                {
                    model: models.goodsDispatchDetails,
                    attributes: ['id', 'productId', 'quantity'],
                    include: [
                        {
                            model: models.products,
                            attributes: ['name', 'price'],
                            include: [
                                {
                                    model: models.bakingFacilityUnits,
                                    attributes: ['id', 'facilityUnit'],
                                },
                            ],
                        },
                    ],
                },
                {
                    model: models.clients,
                    attributes: ['id', 'name'],
                },
            ],
        })

        res.status(200).json({
            status: 'success',
            data: dispatch,
        })
    }

    async createDispatch(req, res, next) {
        const dispatchData = req.body

        // console.log(dispatchData)

        const dispatch = await models.goodsDispatch.create({
            clientId: dispatchData.userId,
            dispatch: dispatchData.dispatch,
        })

        const dispatchDetails = dispatchData.products.map((sale) => ({
            goodsDispatchId: dispatch.id,
            productId: sale.id,
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
