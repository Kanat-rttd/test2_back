const models = require('../models')

class BakingController {
    async getAll(req, res, next) {
        const data = await models.baking.findAll({
            attributes: [
                'id',
                'breadType',
                'flour',
                'salt',
                'yeast',
                'malt',
                'butter',
                'temperature',
                'time',
                'output',
                'spoilage',
            ],
        })
        console.log(data)
        return res.json(data)
    }
}

module.exports = new BakingController()
