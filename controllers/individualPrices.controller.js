// const models = require('../models')
const { Op } = require('sequelize')

// class IndividualPricesController {
//     async getAll(req, res, next) {
//         const data = await models.individualPrices.findAll({
//             attributes: ['id', 'price'],
//             include: [
//                 {
//                     model: models.clients,
//                     attributes: ['id', 'name'],
//                 },
//                 {
//                     model: models.products,
//                     attributes:['id','name']
//                 }

//             ],
//         })
//         console.log(data)
//         return res.json(data)
//     }
// }

// module.exports = new IndividualPricesController()

const models = require('../models')

class IndividualPricesController {
    async getAll(req, res, next) {
        try {
            // Получаем всех клиентов
            const clients = await models.clients.findAll({
                attributes: ['id', 'name'],
            })

            const data = await Promise.all(
                clients.map(async (client) => {
                    const clientData = {
                        clientId: client.id,
                        clientName: client.name,
                        detail: [],
                    }

                    // Получаем данные о ценах для данного клиента
                    const individualPrices = await models.individualPrices.findAll({
                        where: {
                            clientId: client.id,
                            isDeleted: {
                                [Op.ne]: 1,
                            },
                        },
                        attributes: ['id', 'price', 'createdAt'],
                        include: [
                            {
                                model: models.products,
                                attributes: ['id', 'name'],
                            },
                        ],
                    })

                    // console.log(individualPrices)

                    // Добавляем информацию о ценах для клиента, если она есть
                    if (individualPrices.length > 0) {
                        // console.log(individualPrices)
                        clientData.detail = individualPrices.map((price) => ({
                            individualPriceId: price.id,
                            id: price.product.id,
                            name: price.product.name,
                            price: price.price,
                            date: price.createdAt,
                        }))
                    }

                    return clientData
                }),
            )

            console.log(data[0].detail)
            return res.json(data)
        } catch (error) {
            console.error(error)
            return res.status(500).json({ message: 'Internal server error' })
        }
    }

    async createIndividualPrice(req, res, next) {
        const individualPriceData = req.body

        // console.log(individualPriceData)

        await models.individualPrices.create({
            price: individualPriceData.detail[0].price,
            clientId: individualPriceData.clientId,
            productId: individualPriceData.detail[0].id,
        })

        return res.status(200).send('IndividualPrice Created')
    }

    async updateIndividualPrice(req, res, next) {
        const { id } = req.params

        const individualPriceData = req.body

        const updateObj = {
            price: individualPriceData.detail[0].price,
        }

        // console.log(id, individualPriceData.detail[0].id, individualPriceData.detail[0].price)

        await models.individualPrices.update(updateObj, {
            where: {
                productId: individualPriceData.detail[0].id,
                clientId: id,
            },
        })

        return res.status(200).send('Individual Price updated')
    }

    async deleteIndividualPrice(req, res, next) {
        const { id } = req.params
        await models.individualPrices.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).send('Individual Price updated')
    }
}

module.exports = new IndividualPricesController()
