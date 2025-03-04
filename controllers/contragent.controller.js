const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const models = require('../models')
const { model } = require('../config/db')

class ContragentController {
    async getAll(req, res, next) {
        const { status, type } = req.query

        let filterOptions = {}

        if (status) filterOptions.status = status

        if (type) filterOptions.contragentTypeId = type

        const data = await models.contragent.findAll({
            attributes: ['id', 'contragentName', 'mainId', 'contragentTypeId', 'status', 'isDeleted'],
            include: [
                {
                    attributes: ['id', 'type'],
                    model: models.contragentType,
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

    async createContragent(req, res, next) {
        const { contragentName, type, mainId, status } = req.body

        const createdContragent = await models.contragent.create({
            contragentName,
            type,
            mainId,
            status,
        })

        return res.status(200).json({ message: 'Контрагент успешно создан', data: createdContragent })
    }

    async updateContragent(req, res, next) {
        const { id } = req.params
        const { contragentName, type, status } = req.body

        const updateObj = {
            contragentName,
            type,
            status,
        }

        const updatedContragent = await models.contragent.update(updateObj, {
            where: {
                id,
            },
        })

        return res.status(200).json({ message: 'Контрагент успешно обновлен', data: updatedContragent })
    }

    async deleteContragent(req, res, next) {
        const { id } = req.params
        const deletedContragent = await models.contragent.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).json({ message: 'Контрагент успешно удален', data: deletedContragent })
    }
}

module.exports = new ContragentController()
