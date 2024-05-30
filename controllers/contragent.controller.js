const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const models = require('../models')
const { model } = require('../config/db')

class ContragentController {
    async getAll(req, res, next) {
        const { status } = req.query

        let filterOptions = {}

        if (status) filterOptions.status = status

        const data = await models.contragent.findAll({
            attributes: ['id', 'contragentName', 'type', 'status', 'isDeleted'],
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
        const contragentData = req.body

        const createdContragent = await models.contragent.create({
            contragentName: contragentData.contragentName,
            type: contragentData.type,
            status: contragentData.status,
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

        return res.status(200).json({ message: 'Контрагент успешно обнавлен', data: updatedContragent })
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
