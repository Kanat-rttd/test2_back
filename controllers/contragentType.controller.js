const models = require('../models')

class ContragentType {
    async getAll(req, res, next) {
        const { type } = req.query

        let filterOptions = {}

        if (type) {
            filterOptions.type = type
        }

        const data = await models.contragentType.findAll({
            attributes: ['id', 'type'],
            where: { ...filterOptions },
        })
        return res.json(data)
    }
}

module.exports = new ContragentType()
