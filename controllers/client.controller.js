const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
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
        const { name, telegrammId, status } = req.query
        console.log('query Recieved', name, telegrammId, status)
        let filterOptions = {}

        if (name) filterOptions.name = name
        if (telegrammId) filterOptions.telegrammId = telegrammId
        if (status) filterOptions.status = status

        const data = await models.clients.findAll({
            attributes: ['id', 'name', 'surname', 'contact', 'telegrammId', 'status'],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
        })
        return res.json(data)
    }

    async createClient(req, res, next) {
        const { name, surname, contact, telegrammId, status, password } = req.body

        const hashedPass = await bcrypt.hash(password, 10)

        const createdClient = await models.clients.create({
            name,
            surname,
            contact,
            telegrammId,
            status,
            password: hashedPass,
        })

        await models.contragent.create({
            contragentName: name,
            status,
            mainId: createdClient.id,
            type: 'реализатор',
        })

        return res.status(200).json({ message: 'Клиент успешно создан', data: createdClient })
    }

    async updateClient(req, res, next) {
        const { id } = req.params
        const { name, surname, contact, telegrammId, status, password } = req.body
    
        const updateObj = {
            name,
            surname,
            contact,
            telegrammId,
            status,
        }
    
        if (password !== undefined && password !== null && password !== '') {
            const hashedPass = await bcrypt.hash(password, 10)
            updateObj.password = hashedPass
        }
    
        const findedClient = await models.clients.findByPk(id)
    
        await models.contragent.update(
            { contragentName: name, status },
            { where: { contragentName: findedClient.name } },
        )
    
        const updatedClient = await models.clients.update(updateObj, {
            where: {
                id,
            },
            individualHooks: true,
        })
    
        return res.status(200).json({ message: 'Клиент успешно обновлен', data: updatedClient })
    }
    

    async deleteClient(req, res, next) {
        const { id } = req.params

        const findedClient = await models.clients.findByPk(id)

        await models.contragent.update(
            {
                isDeleted: true,
            },
            {
                where: { contragentName: findedClient.name },
            },
        )

        const deletedClietn = await models.clients.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).json({ message: 'Клиент успешно удален', data: deletedClietn })
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
