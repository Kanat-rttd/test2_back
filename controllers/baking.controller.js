const models = require('../models')
const { Op } = require('sequelize')
const Sequelize = require('../config/db')
const dayjs = require('dayjs')

class BakingController {
    async getAll(req, res, next) {
        try {
            const { startDate, endDate, facilityUnit } = req.query
            console.log('Received query parameters:', startDate, endDate, facilityUnit)

            let filterOptions = {}
            let filterOptionsDate = {}

            const time = '14:00:00'
            const dateFrom = dayjs(startDate).add(-1, 'day')
            const dateTo = dayjs(endDate)

            if (startDate && endDate) {
                filterOptionsDate.dateTime = {
                    [Op.between]: [
                        dayjs(dateFrom).set('hours', 14).format('YYYY-MM-DD HH:mm'),
                        dayjs(dateTo).set('hours', 14).format('YYYY-MM-DD HH:mm'),
                    ],
                }
            }

            if (facilityUnit) {
                filterOptions.facilityUnit = facilityUnit
            }

            const bakingData = await models.baking.findAll({
                attributes: [
                    'id',
                    'flour',
                    'salt',
                    'yeast',
                    'malt',
                    'butter',
                    'temperature',
                    'dateTime',
                    // 'time',
                    // 'date',
                    'output',
                    'defective',
                ],
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
                    // [Op.and]: [
                    //     { date: { [Op.gte]: dateFrom, [Op.lte]: dateTo  } },
                    //     {
                    //       [Op.or]: [
                    //         {
                    //           date: dateTo,
                    //           time: { [Op.lt]: time }
                    //         },
                    //         {
                    //           date: dateFrom,
                    //           time: { [Op.gt]: time }
                    //         }
                    //       ]
                    //     }
                    //   ]
                },
            })
            console.log(bakingData)

            const totals = await models.baking.findOne({
                attributes: [
                    [Sequelize.literal('SUM(flour)'), 'totalFlour'],
                    [Sequelize.literal('SUM(salt)'), 'totalSalt'],
                    [Sequelize.literal('SUM(yeast)'), 'totalYeast'],
                    [Sequelize.literal('SUM(malt)'), 'totalMalt'],
                    [Sequelize.literal('SUM(butter)'), 'totalButter'],
                    [Sequelize.literal('SUM(output)'), 'totalOutput'],
                    [Sequelize.literal('SUM(defective)'), 'totalDefective'],
                ],
                required: true,
                include: [
                    {
                        model: models.products,
                        required: true,
                        attributes: [],
                        include: [
                            {
                                attributes: [],
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
                raw: true,
            })
            console.log(totals)

            const formattedTotals = {
                totalFlour: parseFloat(totals.totalFlour).toFixed(2),
                totalSalt: parseFloat(totals.totalSalt).toFixed(2),
                totalYeast: parseFloat(totals.totalYeast).toFixed(2),
                totalMalt: parseFloat(totals.totalMalt).toFixed(2),
                totalButter: parseFloat(totals.totalButter).toFixed(2),
                totalOutput: parseFloat(totals.totalOutput).toFixed(2),
                totalDefective: parseFloat(totals.totalDefective).toFixed(2),
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
        const { breadType, flour, salt, yeast, malt, butter, temperature, dateTime, output, defective } = req.body

        await models.baking.create({
            productId: breadType,
            flour,
            salt,
            yeast,
            malt,
            butter,
            temperature,
            dateTime,
            // time,
            // date,
            output,
            defective,
        })

        return res.status(200).send('Baking Created')
    }

    async updateBaking(req, res) {
        const { id } = req.params
        const { breadType, flour, salt, yeast, malt, butter, temperature, dateTime, output, defective } = req.body

        const updateObj = {
            productId: breadType,
            flour,
            salt,
            yeast,
            malt,
            butter,
            temperature,
            dateTime,
            output,
            defective,
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
