const models = require('../models')

class FinanceAccount {
    async getAll(req, res, next) {
        const data = await models.financeAccount.findAll({
            attributes: ['id', 'name'],
        })
        return res.json(data)
    }
}

module.exports = new FinanceAccount()
