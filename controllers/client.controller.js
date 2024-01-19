const { Op } = require('sequelize')
const models = require('../models')

class ClientController {
    async getAll(req, res, next) {
        const data = await models.clients.findAll({
            attributes: ['id', 'name', 'email'],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
            },
        })
        return res.json(data)
    }

    async createClient(req, res, next) {
        const { name, email } = req.body
        await models.clients.create({
            name: name,
            email: email,
        })
        return res.status(200).send('Client Created')
    }

    async updateClient(req, res, next) {
        const { id } = req.params
        console.log(id)
        const { name, email } = req.body
        await models.clients.update(
            {
                name,
                email,
            },
            {
                where: {
                    id,
                },
            },
        )
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
}

module.exports = new ClientController()
