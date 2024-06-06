const models = require('../models')
const { Op, literal } = require('sequelize')
const sequelize = require('../config/db')

class OverPriceController {
    async getAll(req, res, next) {
        try {
            const { name, month, year } = req.query

            let filterOptions = {}
            if (name) {
                filterOptions.name = name
            }
            
            const data = await models.overPrice.findAll({
                attributes: ['id', 'price', 'clientId', 'month', 'year', 'isDeleted'],
                include: [
                    {
                        model: models.clients,
                        attributes: ['id', 'name'],
                        where: filterOptions,
                    },
                ],
                where: {
                    isDeleted: {
                        [Op.ne]: 1,
                    },
                    [Op.and]: [
                        literal(`EXTRACT(MONTH FROM ("overPrices"."month")) =${Number(month)}`),
                        literal(`EXTRACT(YEAR FROM ("overPrices"."year"))=${Number(year)}`),
                    ],
                },
            })

            return res.json(data)
        } catch (error) {
            return next(error)
        }
    }

    async createOverPrice(req, res, next) {
        const overPriceData = req.body

        const existingRecord = await models.overPrice.findOne({
            where: {
                clientId: overPriceData.data.clientId,
                year: overPriceData.data.year,
                month: overPriceData.data.month,
            },
        })

        if (existingRecord) {
            res.status(400).send({ message: 'Для одного реализатора в одном месяце должна быть только одна запись' })
        } else {
            await models.overPrice.create({
                price: overPriceData.data.price,
                clientId: overPriceData.data.clientId,
                month: overPriceData.data.month,
                year: overPriceData.data.year,
            })
            return res.status(200).send('OverPrice Created')
        }
    }

    async updateOverPrice(req, res, next) {
        const { id } = req.params
        // console.log(id)

        console.log(req.body)

        const { clientId, month, year, price } = req.body

        const updateObj = {
            price,
            clientId,
            year,
            month,
        }

        await models.overPrice.update(updateObj, {
            where: {
                id,
            },
        })

        return res.status(200).send('OverPrice updated')
    }

    async delOverPrice(req, res) {
        const { id } = req.params

        const deletedOverPrice = await models.overPrice.destroy({
            where: {
                id,
            },
        })

        return res.json({ message: 'overPrice deleted' })
    }

    async getClientsForFilter(req, res, next) {
        try {
            const data = await models.overPrice.findAll({
                attributes: ['clientId'],
                include: [
                    {
                        model: models.clients,
                        attributes: ['id', 'name'],
                    },
                ],
                group: ['clientId'],
            })

            return res.json(data)
        } catch (error) {
            return next(error)
        }
    }
}

module.exports = new OverPriceController()
