const models = require('../models')

class FinanceCategories {
    async getAll(req, res, next) {
        const decodedType = decodeURIComponent(req.query.type)

        let filterOptions = {}

        if (decodedType) {
            filterOptions.type = decodedType
        }
        const data = await models.financeCategories.findAll({
            attributes: ['id', 'name', 'type'],
            where: filterOptions,
        })
        return res.json(data)
    }
}

module.exports = new FinanceCategories()
