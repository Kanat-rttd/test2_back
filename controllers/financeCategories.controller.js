const models = require('../models')

class FinanceCategories {
    async getAll(req, res, next) {
        const data = await models.financeCategories.findAll({
            attributes: ['id', 'name', 'type'],
        })
        return res.json(data)
    }
}

module.exports = new FinanceCategories()
