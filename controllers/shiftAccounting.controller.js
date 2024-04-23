const { col } = require('../config/db')
const models = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')
const AppError = require('../filters/appError')
const Sequelize = require('../config/db')

class ShiftAccountingController {
    async getAll(req, res, next) {
        const shiftAccounting = await models.shiftAccounting.findAll({
            attributes: ['id', 'date', 'bakingFacilityUnitId'],
            include: [
                {
                    model: models.shiftAccountingDetails,
                    attributes: ['id', 'shiftAccountingId', 'departPersonalId', 'shiftTime'],
                    include: [
                        {
                            model: models.departPersonal,
                            attributes: ['id', 'name'],
                        },
                    ],
                },
                {
                    model: models.bakingFacilityUnits,
                    attributes: ['id', 'facilityUnit'],
                },
            ],
        })

        console.log(shiftAccounting)

        res.status(200).json(shiftAccounting)
    }

    // async createShiftAccounting(req, res, next) {
    //     const shiftAccountingData = req.body

    //     const dispatch = await models.goodsDispatch.create({
    //         clientId: dispatchData.userId,
    //         dispatch: dispatchData.dispatch,
    //     })

    //     const dispatchDetails = dispatchData.products.map((sale) => ({
    //         goodsDispatchId: dispatch.id,
    //         productId: sale.id,
    //         quantity: sale.quantity,
    //     }))

    //     await models.goodsDispatchDetails.bulkCreate(dispatchDetails)

    //     res.status(200).json({
    //         status: 'success',
    //         message: 'Заказ успешно создан',
    //     })
    // }
}

module.exports = new ShiftAccountingController()
