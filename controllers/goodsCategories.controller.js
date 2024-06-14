const models = require('../models')

class GoodsCategories {
    async getAll(req, res, next) {
        const { categoryId } = req.query

        let filterOptions = {}

        if (categoryId) {
            filterOptions.id = categoryId
        }
        const data = await models.goodsCategories.findAll({
            attributes: ['id', 'category' ],
            where: {...filterOptions},
        })
        return res.json(data)
    }
}

module.exports = new GoodsCategories()
