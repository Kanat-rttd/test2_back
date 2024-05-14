const models = require('../models')

class ProvidersController {
    async getAllProviders(req, res, next) {
        const data = await models.providers.findAll({
            attributes: ['id', 'name'],
        })

        const transformedData = data.map((provider) => ({
            label: provider.name,
            value: provider.id,
        }))

        return res.json(transformedData)
    }
}

module.exports = new ProvidersController()
