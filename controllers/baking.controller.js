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

            const categoryMap = {
                Мука: 'totalFlour',
                Соль: 'totalSalt',
                Дрожжи: 'totalYeast',
                Солод: 'totalMalt',
                Масло: 'totalButter',
            }

            const result = {
                totalFlour: 0,
                totalSalt: 0,
                totalYeast: 0,
                totalMalt: 0,
                totalButter: 0,
                totalOutput: 0,
                totalDefective: 0,
            }

            baking.forEach((baking) => {
                baking.bakingDetails.forEach((detail) => {
                    const categoryKey = categoryMap[detail.goodsCategory.category]
                    if (categoryKey) {
                        result[categoryKey] += detail.quantity
                    }
                })
                result.totalOutput += baking.output
                result.totalDefective += baking.defective
            })

            const data = {
                bakingData: baking,
                totals: result,
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
