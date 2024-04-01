const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const models = require('../models')
const { model } = require('../config/db')

class ClientController {
    // async getAll(req, res, next) {
    //     const data = await models.clients.findAll({
    //         attributes: ['id', 'name', 'surname', 'contact', 'telegrammId', 'status'],
    //         where: {
    //             isDeleted: {
    //                 [Op.ne]: 1,
    //             },
    //         },
    //     })
    //     return res.json(data)
    // }

    async getAll(req, res, next) {
        let filtersData = req.query.filters
        const filter = {}

        console.log()

        if (Object.keys(filter).length !== 0) {
            if (filtersData.name !== '') filter.name = filtersData.name
            if (filtersData.telegrammId !== '') filter.telegrammId = filtersData.telegrammId
            if (filtersData.status !== '') filter.status = filtersData.status
        }

        const data = await models.clients.findAll({
            attributes: ['id', 'name', 'surname', 'contact', 'telegrammId', 'status'],
            where: filter,
        })
        return res.json(data)
    }

    async createClient(req, res, next) {
        const { name, surname, contact, telegrammId, status, password } = req.body

        const hashedPass = await bcrypt.hash(password, 10)
        //TODO: На фронт можно вернуть сообщение с ключом message и нового клиента для взаимодействия
        await models.clients.create({
            name,
            surname,
            contact,
            telegrammId,
            status,
            password: hashedPass,
        })
        return res.status(200).send('Client Created')
    }

    async updateClient(req, res, next) {
        const { id } = req.params
        // console.log(id)
        const { name, surname, contact, telegrammId, status, password } = req.body

        const updateObj = {
            name,
            surname,
            contact,
            telegrammId,
            status,
            password,
        }

        if (password !== undefined && password !== null && password !== '') {
            const hashedPass = await bcrypt.hash(password, 10)
            updateObj.password = hashedPass
        }

        await models.clients.update(updateObj, {
            where: {
                id,
            },
        })

        return res.status(200).send('Client updated')
    }

    async deleteClient(req, res, next) {
        const { id } = req.params
        await models.clients.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).json({ id: id })
    }

    async findByFilters(req, res, next) {
        const { name, telegrammId, status } = req.body

        // console.log(status)

        const filter = {}
        if (name) filter.name = name
        if (telegrammId) filter.telegrammId = telegrammId
        if (status) filter.status = status

        try {
            const result = await models.clients.findAll({ where: filter })
            res.status(200).json({
                status: 'success',
                data: result,
            })
        } catch (error) {
            console.error('Error finding clients:', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}

module.exports = new ClientController()
