const models = require('../models')
const { Op, literal } = require('sequelize')
const sequelize = require('../config/db')

class OverPriceController {
    async getAll(req, res, next) {
        try {
            const { name, month, year } = req.query

            let filterOptions = {}
            if (name) {
                filterOptions.contragentName = name
            }

            let filterOptionsDate = {}
            if (month && year) {
                filterOptionsDate.month = month
                filterOptionsDate.year = year
            }

            const data = await models.overPrices.findAll({
                attributes: ['id', 'price', 'contragentId', 'month', 'year', 'isDeleted'],
                include: [
                    {
                        model: models.contragent,
                        attributes: ['id', 'contragentName'],
                        where: filterOptions,
                    },
                ],
                where: {
                    isDeleted: {
                        [Op.ne]: 1,
                    },
                    ...filterOptionsDate,
                },
            })

            return res.json(data)
        } catch (error) {
            return next(error)
        }
    }

    async createOverPrice(req, res, next) {
        const overPriceData = req.body

        const createdOverPrice = await models.overPrices.create({
            price: overPriceData.data.price,
            contragentId: overPriceData.data.contragentId,
            month: overPriceData.data.month,
            year: overPriceData.data.year,
        })

        return res.status(200).json({ message: 'OverPrice Created', data: createdOverPrice })
    }

    async updateOverPrice(req, res, next) {
        const { id } = req.params

        const { contragentId, month, year, price } = req.body

        const updateObj = {
            price,
            contragentId,
            year,
            month,
        }

        const updatedData = await models.overPrices.update(updateObj, {
            where: {
                id,
            },
            individualHooks: true,
        })

        return res.status(200).json({message: 'OverPrice updated', data: updatedData})
    }

    async delOverPrice(req, res) {
        const { id } = req.params

        const deletedOverPrice = await models.overPrices.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
            },
        )

        return res.status(200).json({ message: 'overPrice deleted', data: deletedOverPrice })
    }

    async getClientsForFilter(req, res, next) {
        try {
            const data = await models.overPrices.findAll({
                attributes: ['contragentId'],
                include: [
                    {
                        model: models.contragent,
                        attributes: ['id', 'contragentName'],
                    },
                ],
                group: ['contragentId'],
            })

            return res.json(data)
        } catch (error) {
            return next(error)
        }
    }
}

module.exports = new OverPriceController()
