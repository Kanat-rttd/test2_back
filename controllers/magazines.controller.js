const { Op } = require('sequelize')
const sequelize = require('../config/db')
const models = require('../models')

class MagazinesController {
    async getAll(req, res) {
        const { name, clientId, status } = req.query
        let filterOptions = {}

        let filterClient = {}

        if (name) filterOptions.name = name
        if (clientId) filterClient.id = clientId
        if (status) filterOptions.status = status

        const data = await models.magazines.findAll({
            attributes: ['id', 'name', 'clientId', 'status'],
            include: [
                {
                    attributes: ['id', 'name'],
                    model: models.clients,
                    where: filterClient,
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

    async createMagazine(req, res) {
        const magazineData = req.body

        const existingMagazine = await models.magazines.findOne({
            where: { isDeleted: false, name: magazineData.data.name },
        })
        if (existingMagazine != null) {
            console.log(existingMagazine)
            return res.status(409).json({ message: 'Такой магазин уже существует', data: existingMagazine })
        }

        const tr = await sequelize.transaction()

        try {
            const createdMagazine = await models.magazines.create(
                {
                    name: magazineData.data.name,
                    clientId: magazineData.data.clientId,
                    status: magazineData.data.status,
                },
                { transaction: tr },
            )

            const finedCantragentType = await models.contragentType.findOne({
                where: { type: 'магазин' },
            })

            const createdContragent = await models.contragent.create(
                {
                    contragentName: magazineData.data.name,
                    status: magazineData.data.status,
                    mainId: createdMagazine.id,
                    contragentTypeId: finedCantragentType.id,
                },
                { transaction: tr },
            )

            await tr.commit()

            return res.status(200).json({ message: 'Магазин успешно создан', data: createdMagazine })
        } catch (error) {
            console.log(error)
            await tr.rollback()
        }
    }

    async updateMagazine(req, res) {
        const { id } = req.params
        const { name, status, clientId } = req.body

        const foundMagazine = await models.magazines.findByPk(id)

        if (name !== foundMagazine.name) {
            const existingMagazine = await models.magazines.findOne({
                where: { isDeleted: false, name },
            })

            if (existingMagazine != null) {
                console.log(existingMagazine)
                return res.status(409).json({ message: 'Такой магазин уже существует', data: existingMagazine })
            }
        }

        const tr = await sequelize.transaction()

        try {
            await models.contragent.update(
                { contragentName: name, status: status },
                {
                    where: {
                        mainId: id,
                        contragentTypeId: 4,
                    },
                },
            )

            const updatedMagazine = await models.magazines.update(
                {
                    name,
                    clientId,
                    status,
                },
                {
                    where: {
                        id,
                    },
                    individualHooks: true,
                },
            )
            await tr.commit()

            return res.status(200).json({ message: 'Магазин успешно обновлен', data: updatedMagazine })
        } catch (error) {
            console.log(error)
            await tr.rollback()
        }
    }

    async deleteMagazine(req, res) {
        const { id } = req.params

        const tr = await sequelize.transaction()

        try {
            const findedMagazine = await models.magazines.findByPk(id)

            await models.contragent.update(
                {
                    isDeleted: true,
                },
                {
                    where: { contragentName: findedMagazine.name },
                },
            )

            const deletedMagazine = await models.magazines.update(
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

            return res.status(200).json({ message: 'Магазин успешно удален', data: deletedMagazine })
        } catch (error) {
            console.log(error)
            await tr.rollback()
        }
    }
}

module.exports = new MagazinesController()
