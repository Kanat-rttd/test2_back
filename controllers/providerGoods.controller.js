const { Op } = require('sequelize')
const models = require('../models')
class ProviderGoodsController {
    async getAll(req, res, next) {
        const { status } = req.query
        console.log('query Recieved', status)
        let filterOptions = {}

        if (status) filterOptions.status = status

        const data = await models.providerGoods.findAll({
            attributes: ['id', 'providerId', 'goods', 'unitOfMeasure', 'place', 'status'],
            include: [
                {
                    attributes: ['id', 'name'],
                    model: models.providers,
                },
            ],
            where: filterOptions,
        })
        return res.json(data)
    }

    async createProviderGoods(req, res, next) {
        const providerGoodsData = req.body

        const data = providerGoodsData.bakery.map((bakeryItem) => ({
            providerId: providerGoodsData.provider,
            goods: providerGoodsData.goods,
            unitOfMeasure: providerGoodsData.unitOfMeasure,
            place: bakeryItem.label,
            status: providerGoodsData.status,
        }))

        await models.providerGoods.bulkCreate(data)

        res.status(200).json({
            status: 'success',
            message: 'Поставщик товары успешно созданы',
        })
    }
}

module.exports = new ProviderGoodsController()
