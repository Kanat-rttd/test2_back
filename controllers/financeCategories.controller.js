const models = require('../models')

class FinanceCategories {
    async getAll(req, res, next) {
        const { type, contragentTypeId } = req.query

        let filterOptions = {}

        if (type) {
            filterOptions.type = type
        }
        if (contragentTypeId) {
            filterOptions.contragentTypeId = contragentTypeId
        }
        const data = await models.financeCategories.findAll({
            attributes: ['id', 'name', 'type', 'contragentTypeId'],
            include: [
                {
                    attributes: ['id', 'type'],
                    model: models.contragentType,
                },
            ],
            where: { ...filterOptions },
        })
        return res.json(data)
    }
}

module.exports = new FinanceCategories()
