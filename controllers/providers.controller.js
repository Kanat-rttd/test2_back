const models = require('../models')
const { Op } = require('sequelize')

class ProvidersController {
    async getAllProviders(req, res, next) {

        const { status } = req.query

        let filterOptions = {}

        if (status) filterOptions.status = status

        const data = await models.providers.findAll({
            attributes: ['id', 'providerName', 'status'],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
        })
        return res.json(data)
    }

    async createProvider(req, res, next) {
        const { providerName, status } = req.body

        const createdProvider = await models.providers.create({
            providerName,
            status,
        })

        await models.contragent.create({
            contragentName: providerName,
            status,
            type: 'поставщик',
        })

        return res.status(200).json({ message: 'Поставщик успешно создан', data: createdProvider })
    }

    async updateProvider(req, res, next) {
        const { id } = req.params
        const { providerName, status } = req.body

        const findedProvider = await models.providers.findByPk(id)

        await models.contragent.update(
            { contragentName: providerName, status },
            { where: { contragentName: findedProvider.name } },
        )

        const updetedProvider = await models.providers.update(
            { providerName, status },
            {
                where: {
                    id,
                },
            },
        )

        return res.status(200).json({ message: 'Поставщик успешно обновлен', data: updetedProvider })
    }

    async deleteProvider(req, res, next) {
        const { id } = req.params

        const findedProvider = await models.providers.findByPk(id)

        await models.contragent.update(
            {
                isDeleted: true,
            },
            {
                where: { contragentName: findedProvider.name },
            },
        )

        const deletedProvider = await models.providers.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
            },
        )

        return res.status(200).json({ message: 'Поставщик успешно удален', data: deletedProvider })
    }
}

module.exports = new ProvidersController()
