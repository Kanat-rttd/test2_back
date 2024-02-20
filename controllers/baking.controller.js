const models = require('../models')
const Sequelize = require('../config/db')

class BakingController {
    // async getAll(req, res, next) {
    //     const data = await models.baking.findAll({
    //         attributes: ['id', 'flour', 'salt', 'yeast', 'malt', 'butter', 'temperature', 'time', 'output'],
    //         include: [
    //             {
    //                 attributes: ['name', 'id'],
    //                 model: models.products,
    //             },
    //         ],
    //     })

    //     console.log(data)
    //     return res.json(data)
    // }

    async getAll(req, res, next) {
        try {
            const bakingData = await models.baking.findAll({
                attributes: ['id', 'flour', 'salt', 'yeast', 'malt', 'butter', 'temperature', 'time', 'output'],
                include: [
                    {
                        attributes: ['name', 'id'],
                        model: models.products,
                    },
                ],
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
            })

            const data = {
                bakingData,
                totals: totals[0].toJSON(), // Получаем итоговые значения из первого элемента результата
            }

            console.log(data)
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
}

module.exports = new BakingController()
