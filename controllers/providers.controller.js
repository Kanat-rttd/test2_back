const models = require('../models')

class ProvidersController {
    async getAllProviders(req, res, next) {
        const data = await models.providers.findAll({
            attributes: ['id', 'name'],
        })
        // console.log(data)
        return res.json(data)
    }
}

module.exports = new ProvidersController()
