const { Op } = require('sequelize')
const models = require('../models')

class ProviderGoodsController {
    async getAll(req, res, next) {
        const { status } = req.query
        console.log('query Recieved', status)
        let filterOptions = {}

        if (status) filterOptions.status = status

        const data = await models.providerGoods.findAll({
            attributes: ['id', 'providerId', 'goods', 'unitOfMeasure', 'place', 'status', 'isDeleted'],
            include: [
                {
                    attributes: ['id', 'providerName', 'status'],
                    model: models.providers,
                },
            ],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
        })
        return res.json(data)
    }

    async createProviderGoods(req, res, next) {
        const providerGoodsData = req.body

        const places = providerGoodsData.bakery.map((bakeryItem) => ({ label: bakeryItem.label }))

        const placesString = JSON.stringify(places)

        const data = {
            providerId: providerGoodsData.providerId,
            goods: providerGoodsData.goods,
            unitOfMeasure: providerGoodsData.unitOfMeasure,
            place: placesString,
            status: providerGoodsData.status,
        }

        const createdIndividualPrice = await models.providerGoods.create(data)

        res.status(200).json({
            message: 'Товар успешно создан',
            data: createdIndividualPrice,
        })
    }

    async updateProviderGoods(req, res) {
        const { id } = req.params
        const providerGoodsData = req.body

        const places = providerGoodsData.bakery.map((bakeryItem) => ({ label: bakeryItem.label }))

        const placesString = JSON.stringify(places)

        const data = {
            providerId: providerGoodsData.providerId,
            goods: providerGoodsData.goods,
            unitOfMeasure: providerGoodsData.unitOfMeasure,
            place: placesString,
            status: providerGoodsData.status,
        }

        console.log(data)

        const updatedProviderGoods = await models.providerGoods.update(data, {
            where: {
                id,
            },
            individualHooks: true,
        })

        return res.status(200).json({ message: 'Товар успешно обновлен', data: updatedProviderGoods })
    }

    async deleteProviderGoods(req, res) {
        const { id } = req.params

        const deletedProviderGoods = await models.providerGoods.update(
            { isDeleted: true },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).json({ message: 'Товар успешно удален', data: deletedProviderGoods })
    }
}

module.exports = new ProviderGoodsController()
