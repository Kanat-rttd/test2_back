const { Op } = require('sequelize')
const models = require('../models')

class MagazinesController {
    async getAll(req, res, next) {
        const { name, clientId, status } = req.query
        console.log('query Recieved', name, clientId, status)
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

    async createMagazine(req, res, next) {
        const magazineData = req.body

        console.log(magazineData)

        await models.magazines.create({
            name: magazineData.data.name,
            clientId: magazineData.data.clientId,
            status: magazineData.data.status,
        })

        await models.contragent.create({
            contragentName: magazineData.data.name,
            status: magazineData.data.status,
            type: 'магазин',
        })

        return res.status(200).send('Magazine Created')
    }

    async updateMagazine(req, res, next) {
        const { id } = req.params

        const magazineData = req.body

        const updateObj = {
            name: magazineData.name,
            clientId: magazineData.clientId,
            status: magazineData.status,
        }

        const findedMagazine = await models.magazines.findByPk(id)

        await models.contragent.update(
            { contragentName: magazineData.name, status: magazineData.status },
            { where: { contragentName: findedMagazine.name } },
        )

        await models.magazines.update(updateObj, {
            where: {
                id,
            },
        })

        return res.status(200).send('Magazine updated')
    }

    async deleteMagazine(req, res, next) {
        const { id } = req.params

        const findedMagazine = await models.magazines.findByPk(id)

        await models.contragent.update(
            {
                isDeleted: true,
            },
            {
                where: { contragentName: findedMagazine.name },
            },
        )

        await models.magazines.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).json({
            status: 'success',
            message: 'Magazine deleted',
        })
    }
}

module.exports = new MagazinesController()
