const models = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../config/db')

class FactInputController {
    async getAll(req, res, next) {
        try {
            const { name, place, startDate, endDate } = req.query

            console.log('Recieved data: ', name, place)

            let filterOptions = {}

            if (name) {
                filterOptions.name = name
            }

            if (place) {
                filterOptions.place = place
            }

            if (startDate && endDate) {
                whereClause.createdAt = {
                    [Op.between]: [
                        new Date(startDate).setHours(0, 0, 0, 0),
                        new Date(endDate).setHours(23, 59, 59, 999),
                    ],
                }
            }

            const data = await models.factInput.findAll({
                attributes: ['id', 'name', 'place', 'unitOfMeasure', 'quantity', 'updatedAt'],
                where: filterOptions,
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

    async updateFactInput(req, res, next) {
        const { id } = req.params

        const { name, place, quantity } = req.body

        console.log(name, place, quantity)

        const updateObj = {
            name,
            place,
            quantity,
        }

        // console.log(id, individualPriceData.detail[0].id, individualPriceData.detail[0].price)

        await models.factInput.update(updateObj, {
            where: {
                id,
            },
        })

        return res.status(200).send('Fact input updated')
    }

    async deleteFactInput(req, res) {
        const { id } = req.params

        const deletedUser = await models.factInput.update(
            { isDeleted: true },
            {
                where: {
                    id,
                },
            },
        )

        return res.status(200).json({ message: 'Fact input deleted', data: deletedUser })
    }
}

module.exports = new FactInputController()
