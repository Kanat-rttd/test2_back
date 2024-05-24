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

    async createShiftAccounting(req, res, next) {
        const shiftAccountingData = req.body

        console.log(shiftAccountingData)

        const shiftAccounting = await models.shiftAccounting.create({
            bakingFacilityUnitId: shiftAccountingData.facilityUnitsId,
            date: shiftAccountingData.date,
        })

        const shiftAccountingDetails = shiftAccountingData.departPersonals.map((item) => ({
            shiftAccountingId: shiftAccounting.id,
            departPersonalId: item.id,
            shiftTime: item.hours,
        }))

        await models.shiftAccountingDetails.bulkCreate(shiftAccountingDetails)

        res.status(200).json({
            status: 'success',
            message: 'Учёт-времени успешно создан',
        })
    }
}

module.exports = new ShiftAccountingController()
