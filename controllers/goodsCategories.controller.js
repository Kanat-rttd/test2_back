const models = require('../models')

class GoodsCategories {
    async getAll(req, res, next) {
        const { name } = req.query

        let filterOptions = {}

        if (type) {
            filterOptions.name = name
        }
        const data = await models.goodsCategories.findAll({
            attributes: ['id', 'name' ],
            where: {...filterOptions},
        })
        return res.json(data)
    }
}

module.exports = new GoodsCategories()
