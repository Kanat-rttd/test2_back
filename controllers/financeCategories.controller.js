const models = require('../models')

class FinanceCategories {
    async getAll(req, res, next) {
        const {type} = req.query

        let filterOptions = {}

        if(type){
            filterOptions.type = type
        }
        const data = await models.financeCategories.findAll({
            attributes: ['id', 'name', 'type'],
            where: filterOptions,
        })
        return res.json(data)
    }
}

module.exports = new FinanceCategories()
