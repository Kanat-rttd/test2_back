const models = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../config/db')

class FactInputController {
    async getAll(req, res, next) {
        try {
            const { productId, place } = req.query

            let filterOptions = {}

            if (productId) {
                filterOptions.goodsCategoryId = productId
            }

            if (place) {
                filterOptions.place = place
            }

            const data = await models.factInput.findAll({
                attributes: ['id', 'goodsCategoryId', 'place', 'quantity', 'updatedAt'],
                where: {
                    isDeleted: {
                        [Op.ne]: 1,
                    },
                    ...filterOptions,
                },
                include: [
                    {
                        model: models.goodsCategories,
                        attributes: ['id', 'category', 'unitOfMeasure'],
                    },
                ],
            })

            console.log(data)

            const table = data.map((item) => ({
                id: item.id,
                name: item.goodsCategory.category,
                place: item.place,
                unitOfMeasure: item.goodsCategory.unitOfMeasure,
                quantity: Number(item.quantity),
                updatedAt: item.updatedAt,
            }))

            const totalFact = table.reduce((total, item) => total + item.quantity, 0)

            const responseData = {
                table,
                totalFact,
                data: data,
            }

            return res.json(responseData)
        } catch (error) {
            return next(error)
        }
    }

    async createFactInput(req, res, next) {
        const factInputData = req.body

        try {
            await Promise.all(factInputData.details.map(async (input) => {
                const [factInput, created] = await models.factInput.findOrCreate({
                    where: {
                        goodsCategoryId: input.goodsCategoryId,
                        place: factInputData.place
                    },
                    defaults: {
                        unitOfMeasure: input.unitOfMeasure,
                        quantity: input.quantity,
                    }
                });
    
                if (!created) {
                    await factInput.update({
                        quantity: input.quantity,
                        isDeleted: false
                    });
                }
            }));
    
            res.status(200).json({
                status: 'success',
                message: 'Запись успешно создана',
            });
        } catch (error) {
            console.error('Ошибка при создании записи:', error);
            res.status(500).json({
                status: 'error',
                message: 'Произошла ошибка при создании записи',
            });
        }
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

        await models.factInput.update(updateObj, {
            where: {
                id,
            },
        })

        return res.status(200).json({
            status: 'success',
            message: 'Запись успешно обновлена',
        });
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

        return res.status(200).json({ message: 'Запись успешно удалена', data: deletedUser })
    }
}

module.exports = new FactInputController()
