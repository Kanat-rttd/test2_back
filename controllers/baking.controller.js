const models = require('../models')
const { Op } = require('sequelize')
const Sequelize = require('../config/db')

class BakingController {
    async getAll(req, res, next) {
        try {
            const { startDate, endDate } = req.query
            console.log('Received query parameters:', startDate, endDate)

            const filterOptions = {}
            if (startDate && endDate) {
                filterOptions.createdAt = {
                    [Op.between]: [startDate, endDate],
                }
            }

            const bakingData = await models.baking.findAll({
                attributes: ['id', 'flour', 'salt', 'yeast', 'malt', 'butter', 'temperature', 'time', 'output'],
                include: [
                    {
                        attributes: ['name', 'id'],
                        model: models.products,
                        include: [
                            {
                                attributes: ['facilityUnit', 'id'],
                                model: models.bakingFacilityUnits,
                            },
                        ],
                    },
                ],
                where: filterOptions,
            })

            const totals = await models.baking.findAll({
                attributes: [
                    [Sequelize.literal('SUM(flour)'), 'totalFlour'],
                    [Sequelize.literal('SUM(salt)'), 'totalSalt'],
                    [Sequelize.literal('SUM(yeast)'), 'totalYeast'],
                    [Sequelize.literal('SUM(malt)'), 'totalMalt'],
                    [Sequelize.literal('SUM(butter)'), 'totalButter'],
                    [Sequelize.literal('SUM(output)'), 'totalOutput'],
                ],
                where: filterOptions,
            })

            const data = {
                bakingData,
                totals: totals[0].toJSON(),
            }

            //console.log(data)
            return res.json(data)
        } catch (error) {
            return next(error)
        }
    }

    async createBaking(req, res, next) {
        const { breadType, flour, salt, yeast, malt, butter, temperature, time, output } = req.body

        await models.baking.create({
            productId: breadType,
            flour,
            salt,
            yeast,
            malt,
            butter,
            temperature,
            time,
            output,
        })

        return res.status(200).send('Baking Created')
    }

    async deleteBaking(req, res) {
        const { id } = req.params

        const deletedBakings = await models.baking.update(
            { isDeleted: true },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).json({ message: 'Выпечка успешно удалена' })
    }
}

module.exports = new BakingController()
