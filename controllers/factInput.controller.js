const models = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../config/db')

class FactInputController {
    async getAll(req, res, next) {
        try {
            const data = await models.factInput.findAll({
                attributes: ['id', 'name', 'place', 'unitOfMeasure', 'quantity', 'updatedAt'],
            })

            const table = data.map((item) => ({
                id: item.id,
                name: item.name,
                place: item.place,
                unitOfMeasure: item.unitOfMeasure,
                quantity: Number(item.quantity),
                updatedAt: item.updatedAt,
            }))

            const totalFact = table.reduce((total, item) => total + item.quantity, 0)

            const responseData = {
                table,
                totalFact,
            }

            return res.json(responseData)
        } catch (error) {
            return next(error)
        }
    }

    async createFactInput(req, res, next) {
        const factInputData = req.body

        const factInput = factInputData.map((input) => ({
            name: input.name,
            place: input.place,
            unitOfMeasure: input.unitOfMeasure,
            quantity: input.quantity,
        }))

        await models.factInput.bulkCreate(factInput)

        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно создан',
        })
    }
}

module.exports = new FactInputController()
