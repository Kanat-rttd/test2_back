const models = require('../models')
const { Op, fn, col, literal } = require('sequelize')
const Sequelize = require('../config/db')
const dayjs = require('dayjs')

class BakingController {
    async getAll(req, res, next) {
        try {
            const { startDate, endDate, facilityUnit } = req.query
            console.log('Received query parameters:', startDate, endDate, facilityUnit)

            let filterOptions = {}
            let filterOptionsDate = {}

            const dateFrom = dayjs(startDate).add(-1, 'day')
            const dateTo = dayjs(endDate)

            if (startDate && endDate) {
                filterOptionsDate.dateTime = {
                    [Op.between]: [
                        dayjs(dateFrom).set('hours', 14).format('YYYY-MM-DD HH:mm:ss'),
                        dayjs(dateTo).set('hours', 14).format('YYYY-MM-DD HH:mm:ss'),
                    ],
                }
            }

            if (facilityUnit) {
                filterOptions.id = facilityUnit
            }

            const baking = await models.baking.findAll({
                attributes: ['id', 'productId', 'temperature', 'output', 'defective', 'dateTime', 'createdAt'],
                include: [
                    {
                        model: models.bakingDetails,
                        attributes: ['id', 'bakingId', 'goodsCategoryId', 'quantity'],
                        include: [
                            {
                                model: models.goodsCategories,
                                attributes: ['category'],
                            },
                        ],
                    },
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
                required: true,
                where: {
                    isDeleted: {
                        [Op.ne]: 1,
                    },
                    ...filterOptionsDate,
                },
            })

            const totals = await models.baking.findAll({
                attributes: [
                    [fn('SUM', fn('DISTINCT', col('output'))), 'totalOutput'],
                    [fn('SUM', fn('DISTINCT', col('defective'))), 'totalDefective'],
                    [
                        fn(
                            'SUM',
                            literal(
                                'CASE WHEN bakingDetails.goodsCategoryId = 1 THEN bakingDetails.quantity ELSE 0 END',
                            ),
                        ),
                        'totalFlour',
                    ],
                    [
                        fn(
                            'SUM',
                            literal(
                                'CASE WHEN bakingDetails.goodsCategoryId = 2 THEN bakingDetails.quantity ELSE 0 END',
                            ),
                        ),
                        'totalSalt',
                    ],
                    [
                        fn(
                            'SUM',
                            literal(
                                'CASE WHEN bakingDetails.goodsCategoryId = 3 THEN bakingDetails.quantity ELSE 0 END',
                            ),
                        ),
                        'totalYeast',
                    ],
                    [
                        fn(
                            'SUM',
                            literal(
                                'CASE WHEN bakingDetails.goodsCategoryId = 4 THEN bakingDetails.quantity ELSE 0 END',
                            ),
                        ),
                        'totalMalt',
                    ],
                    [
                        fn(
                            'SUM',
                            literal(
                                'CASE WHEN bakingDetails.goodsCategoryId = 5 THEN bakingDetails.quantity ELSE 0 END',
                            ),
                        ),
                        'totalButter',
                    ],
                ],
                include: [
                    {
                        model: models.bakingDetails,
                        attributes: [],
                        include: [
                            {
                                model: models.goodsCategories,
                                attributes: [],
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

            const data = {
                bakingData: baking, // Предполагается, что bakingData получено из вашего предыдущего запроса
                totals: {
                    totalFlour: parseFloat(totals[0].totalFlour),
                    totalSalt: parseFloat(totals[0].totalSalt),
                    totalYeast: parseFloat(totals[0].totalYeast),
                    totalMalt: parseFloat(totals[0].totalMalt),
                    totalButter: parseFloat(totals[0].totalButter),
                    totalOutput: parseFloat(totals[0].totalOutput),
                    totalDefective: parseFloat(totals[0].totalDefective),
                },
            }

            return res.json(data)
        } catch (error) {
            return next(error)
        }
    }

    async createBaking(req, res, next) {
        const bakingData = req.body

        const createdBaking = await models.baking.create({
            temperature: bakingData.temperature,
            productId: bakingData.breadType,
            output: bakingData.output,
            defective: bakingData.defective,
            dateTime: bakingData.dateTime,
        })

        const bakingDetails = bakingData.bakingDetails.map((detail) => {
            return {
                bakingId: createdBaking.id,
                goodsCategoryId: detail.goodsCategoryId,
                quantity: detail.quantity,
            }
        })

        await models.bakingDetails.bulkCreate(bakingDetails)

        res.status(200).json({
            status: 'success',
            message: 'Выпечка успешно создана',
        })
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
