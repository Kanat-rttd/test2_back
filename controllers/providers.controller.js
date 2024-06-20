const models = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../config/db')

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

        const existingProvider = await models.providers.findOne({
            where: { isDeleted: false, providerName },
        })
        if (existingProvider != null) {
            console.log(existingProvider)
            throw new Error('Поставщик с таким названием уже существует')
        }

        const tr = await sequelize.transaction()

        try {
            const createdProvider = await models.providers.create({
                providerName,
                status,
            })

            await models.contragent.create({
                contragentName: providerName,
                status,
                mainId: createdProvider.id,
                type: 'поставщик',
            })

            await tr.commit()

            return res.status(200).json({ message: 'Поставщик успешно создан', data: createdProvider })
        } catch (error) {
            console.log(error)
            await tr.rollback()
        }
    }

    async updateProvider(req, res, next) {
        const { id } = req.params
        const { providerName, status } = req.body

        const existingProvider = await models.providers.findOne({
            where: { isDeleted: false, providerName },
        })
        if (existingProvider != null) {
            console.log(existingProvider)
            throw new Error('Поставщик с таким названием уже существует')
        }

        const tr = await sequelize.transaction()

        try {
            const findedProvider = await models.providers.findByPk(id)

            await models.contragent.update(
                { contragentName: providerName, status },
                { where: { contragentName: findedProvider.providerName } },
            )

            const updetedProvider = await models.providers.update(
                { providerName, status },
                {
                    where: {
                        id,
                    },
                    individualHooks: true,
                },
            )

            await tr.commit()

            return res.status(200).json({ message: 'Поставщик успешно обновлен', data: updetedProvider })
        } catch (error) {
            console.log(error)
            await tr.rollback()
        }
    }

    async deleteProvider(req, res, next) {
        const { id } = req.params

        const tr = await sequelize.transaction()

        try {
            const findedProvider = await models.providers.findByPk(id)

            await models.contragent.update(
                {
                    isDeleted: true,
                },
                {
                    where: { contragentName: findedProvider.providerName },
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

            await tr.commit()

            return res.status(200).json({ message: 'Поставщик успешно удален', data: deletedProvider })
        } catch (error) {
            console.log(error)
            await tr.rollback()
        }
    }
}

module.exports = new ProvidersController()
