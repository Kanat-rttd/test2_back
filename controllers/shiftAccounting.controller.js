const { col } = require('../config/db')
const models = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')
const AppError = require('../filters/appError')
const Sequelize = require('../config/db')

class ShiftAccountingController {
    async getAll(req, res, next) {
        const { startDate, endDate, facilityUnit, personal } = req.query

        const dateFilterOptions = {}
        const facilityUnitOptions = {}
        const personalOptions = {}

        if (startDate && endDate) {
            dateFilterOptions.date = {
                [Op.between]: [new Date(startDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)],
            }
        }

        if (facilityUnit) {
            facilityUnitOptions.id = facilityUnit
        }

        if (personal) {
            personalOptions.id = personal
        }

        const shiftAccounting = await models.shiftAccounting.findAll({
            attributes: ['id', 'date', 'bakingFacilityUnitId'],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...dateFilterOptions,
            },
            required: true,
            include: [
                {
                    model: models.shiftAccountingDetails,
                    attributes: ['id', 'shiftAccountingId', 'departPersonalId', 'shiftTime'],
                    required: true,
                    include: [
                        {
                            model: models.departPersonal,
                            attributes: ['id', 'name'],
                            where: personalOptions,
                            required: true,
                        },
                    ],
                },
                {
                    model: models.bakingFacilityUnits,
                    attributes: ['id', 'facilityUnit'],
                    where: facilityUnitOptions,
                    required: true,
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

    async updateShiftAccounting(req, res, next) {
        const { id } = req.params
        const data = req.body

        let date = data[0].date
        let updateObj = {}

        const response = await models.shiftAccounting.update({ date }, { where: { id } })

        for (const item of data) {
            updateObj = {
                shiftTime: item.shiftTime,
            }

            await models.shiftAccountingDetails.update(updateObj, {
                where: {
                    id: item.shiftAccountingDetailsId,
                    shiftAccountingId: item.shiftAccountingId,
                    departPersonalId: item.departPersonalId,
                },
            })
        }

        return res.status(200).json({ message: 'Shift updated' })
    }

    async deleteShiftAccounting(req, res) {
        const { id } = req.params

        const deletedShiftAccounting = await models.shiftAccounting.update(
            { isDeleted: true },
            {
                where: {
                    id,
                },
            },
        )

        return res.status(200).json({ message: 'Учёт смен успешно удален' })
    }
}

module.exports = new ShiftAccountingController()
