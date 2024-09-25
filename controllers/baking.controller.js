const models = require('../models')
const { Op } = require('sequelize')
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

            console.log(baking)

            const categoryMap = {
                Мука: 'flour',
                Соль: 'salt',
                Дрожжи: 'yeast',
                Солод: 'malt',
                Масло: 'butter',
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

            const bakingData = baking.map((bakingItem) => {
                let details = {
                    flour: {},
                    salt: {},
                    yeast: {},
                    malt: {},
                    butter: {},
                }

                bakingItem.bakingDetails.forEach((detail) => {
                    const categoryKey = categoryMap[detail.goodsCategory.category]
                    if (categoryKey) {
                        result[`total${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}`] += detail.quantity
                        details[categoryKey] = {
                            bakingId: detail.bakingId,
                            goodsCategoryId: detail.goodsCategoryId,
                            id: detail.id,
                            quantity: detail.quantity,
                        }
                    }
                })

                result.totalOutput += bakingItem.output
                result.totalDefective += bakingItem.defective

                return {
                    id: bakingItem.id,
                    temperature: bakingItem.temperature,
                    output: bakingItem.output,
                    defective: bakingItem.defective,
                    dateTime: bakingItem.dateTime,
                    bakingDetails: bakingItem.bakingDetails.map((detail) => ({
                        bakingId: detail.bakingId,
                        goodsCategoryId: detail.goodsCategoryId,
                        id: detail.id,
                        quantity: detail.quantity,
                    })),
                    product: bakingItem.product
                        ? {
                              name: bakingItem.product.name,
                              id: bakingItem.product.id,
                          }
                        : undefined,
                    ...details,
                }
            })

            const data = {
                bakingData: bakingData,
                totals: result,
            }

            return res.json(data)
        } catch (error) {
            return next(error)
        }
    }

    async createBaking(req, res, next) {
        const bakingData = req.body

        console.log('Время:', bakingData.dateTime)

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
        const { breadType, temperature, dateTime, output, defective, bakingDetails } = req.body

        console.log(bakingDetails)

        const updateObj = {
            productId: breadType,
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

        await models.bakingDetails.bulkCreate(
            bakingDetails.map((bd) => ({
                bakingId: id,
                goodsCategoryId: bd.goodsCategoryId,
                quantity: bd.quantity,
            })),
            {
                fields: ['bakingId', 'goodsCategoryId', 'quantity'],
                updateOnDuplicate: ['bakingId', 'goodsCategoryId'],
            },
        )

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
