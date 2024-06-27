const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const models = require('../models')
const sequelize = require('../config/db')

class ClientController {
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
        const clientData = req.body
        const tr = await sequelize.transaction()

        const existingClientName = await models.clients.findOne({
            where: { isDeleted: false, name: clientData.name },
        })
        if (existingClientName != null) {
            throw new Error('Пользователь с таким именем уже существует')
        }
        console.log(clientData);

        const existingClientPhone = await models.clients.findOne({
            where: { isDeleted: false, contact: clientData.contact },
        })
        if (existingClientPhone != null) {
            throw new Error('Пользователь с таким телефоном уже существует')
        }

        try {
            const hashedPass = await bcrypt.hash(clientData.password, 10)

            const createdClient = await models.clients.create({
                name: clientData.name,
                surname: clientData.surname,
                contact: clientData.contact,
                telegrammId: clientData.telegrammId,
                status: clientData.status,
                password: hashedPass,
            })

            const finedCantragentType = await models.contragentType.findOne({
                where: {type: 'реализатор'}
            })

            console.log(finedCantragentType);

            await models.contragent.create({
                contragentName: clientData.name,
                status: clientData.status,
                mainId: createdClient.id,
                contragentTypeId: finedCantragentType.id,
            })

            await tr.commit()

            return res.status(200).json({ message: 'Клиент успешно создан', data: createdClient })
        } catch (error) {
            console.error(error)
            await tr.rollback()
            next(error)
        }
    }

    async updateClient(req, res, next) {
        const { id } = req.params
        const { name, surname, contact, telegrammId, status, password } = req.body

        const findedClient = await models.clients.findByPk(id)

        const tr = await sequelize.transaction()
        if (name !== findedClient.name) {
            const existingClientName = await models.clients.findOne({
                where: { isDeleted: false, name },
            })
            if (existingClientName != null) {
                throw new Error('Пользователь с таким именем уже существует')
            }
        }

        if (contact !== findedClient.contact) {
            const existingClientPhone = await models.clients.findOne({
                where: { isDeleted: false, contact },
            })
            if (existingClientPhone != null) {
                throw new Error('Пользователь с таким телефоном уже существует')
            }
        }

        try {
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

            await tr.commit()
            return res.status(200).json({ message: 'Клиент успешно обновлен', data: updatedClient })
        } catch (error) {
            console.error(error)
            await tr.rollback()
            next(error)
        }
    }

    async deleteClient(req, res, next) {
        const { id } = req.params

        const tr = await sequelize.transaction()
        try {
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
            await tr.commit()
            return res.status(200).json({ message: 'Клиент успешно удален', data: deletedClietn })
        } catch (error) {
            console.error(error)
            await tr.rollback()
            next(error)
        }
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
