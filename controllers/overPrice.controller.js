const models = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../config/db')

class OverPriceController {
    async getAll(req, res, next) {
        try {
            const { name } = req.query
            console.log('query Recieved', name)
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
            throw new Error('Only one record per name per month is allowed')
        }

        // await models.overPrice.create({
        //     price: overPriceData.data.price,
        //     clientId: overPriceData.data.clientId,
        //     month: overPriceData.data.month,
        //     year: overPriceData.data.year,
        // })
        // return res.status(200).send('OverPrice Created')
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
}

module.exports = new OverPriceController()
