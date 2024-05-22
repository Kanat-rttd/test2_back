const models = require('../models')
const { Op } = require('sequelize')
const Sequelize = require('../config/db')

class BakingController {
    async getAll(req, res, next) {
        try {
            const { startDate, endDate, facilityUnit } = req.query
            console.log('Received query parameters:', startDate, endDate, facilityUnit)

            let filterOptions = {}
            let filterOptionsDate = {}

            // if (startDate && endDate) {
            //     filterOptionsDate.createdAt = {
            //         [Op.and]: [{ [Op.gte]: new Date(startDate) }, { [Op.lte]: endYear }],
            //     }
            // }

            if (startDate && endDate) {
                if (startDate == endDate) {
                    const nextDay = new Date(startDate)
                    nextDay.setDate(nextDay.getDate())
                    nextDay.setHours(1, 0, 0, 0)

                    const endOfDay = new Date(startDate)
                    endOfDay.setDate(endOfDay.getDate())
                    endOfDay.setHours(24, 59, 59, 999)

                    filterOptionsDate.createdAt = {
                        [Op.between]: [nextDay, endOfDay],
                    }
                } else {
                    filterOptionsDate.createdAt = {
                        [Op.between]: [startDate, endDate],
                    }
                }
            }

            if (facilityUnit) {
                filterOptions.facilityUnit = facilityUnit
            }

            const bakingData = await models.baking.findAll({
                attributes: ['id', 'flour', 'salt', 'yeast', 'malt', 'butter', 'temperature', 'time', 'output'],
                required: true,
                include: [
                    {
                        attributes: ['name', 'id'],
                        model: models.products,
                        required: true,
                        include: [
                            {
                                attributes: ['facilityUnit', 'id'],
                                model: models.bakingFacilityUnits,
                                where: filterOptions,
                                required: true,
                            },
                        ],
                    },
                ],
                where: {
                    isDeleted: {
                        [Op.ne]: 1,
                    },
                    ...filterOptionsDate,
                },
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
                group: ['productId'], // Группируем по productId
                required: true,
                include: [
                    {
                        model: models.products,
                        required: true,
                        include: [
                            {
                                model: models.bakingFacilityUnits,
                                where: filterOptions,
                                required: true,
                            },
                        ],
                    },
                ],
                where: {
                    isDeleted: {
                        [Op.ne]: 1,
                    },
                    ...filterOptionsDate,
                },
            })

            const jsonTotals = totals[0].toJSON()

            const formattedTotals = {
                totalFlour: parseFloat(jsonTotals.totalFlour).toFixed(2),
                totalSalt: parseFloat(jsonTotals.totalSalt).toFixed(2),
                totalYeast: parseFloat(jsonTotals.totalYeast).toFixed(2),
                totalMalt: parseFloat(jsonTotals.totalMalt).toFixed(2),
                totalButter: parseFloat(jsonTotals.totalButter).toFixed(2),
                totalOutput: parseFloat(jsonTotals.totalOutput).toFixed(2),
            }

            const data = {
                bakingData,
                totals: formattedTotals,
            }

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

    async updateBaking(req, res) {
        const { id } = req.params
        const { breadType, flour, salt, yeast, malt, butter, temperature, time, output } = req.body

        const updateObj = {
            productId: breadType,
            flour,
            salt,
            yeast,
            malt,
            butter,
            temperature,
            time,
            output,
        }

        await models.baking.update(updateObj, {
            where: {
                id,
            },
        })

        return res.status(200).json({ message: 'Выпечка успешно обновлена', data: updateObj })
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
