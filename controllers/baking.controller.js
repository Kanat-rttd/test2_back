const models = require('../models')

class BakingController {
    async getAll(req, res, next) {
        const data = await models.baking.findAll({
            attributes: ['id', 'flour', 'salt', 'yeast', 'malt', 'butter', 'temperature', 'time', 'output'],
            include: [
                {
                    attributes: ['name', 'id'],
                    model: models.products,
                },
            ],
        })

        console.log(data)
        return res.json(data)
    }

    async createBaking(req, res, next) {
        const { breadType, flour, salt, yeast, malt, butter, temperature, time, output } = req.body

        await models.baking.create({
            breadType,
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
