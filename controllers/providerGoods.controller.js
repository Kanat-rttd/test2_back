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

    async updateProviderGoods(req, res) {
        const { id } = req.params
        const { bakery, goods, providerId, status, unitOfMeasure } = req.body

        const data = bakery.map((place) => ({
            place: place.label,
            goods,
            providerId,
            status,
            unitOfMeasure,
        }))
        console.log(data)

        for (const providerGood of data) {
            console.log(data)
            const updated = await models.providerGoods.update(providerGood, {
                where: {
                    id,
                },
            })
            console.log(updated)
        }
        return res.status(200).json({ message: 'Поставщик товары успешно обновлен' })
    }

    async deleteProviderGoods(req, res) {
        const { id } = req.params

        const deletedProviderGoods = await models.providerGoods.destroy({
            where: {
                id,
            },
        })
        return res.json({ message: 'Поставщик товара успешно удален', data: deletedProviderGoods })
    }
}

module.exports = new ProviderGoodsController()
