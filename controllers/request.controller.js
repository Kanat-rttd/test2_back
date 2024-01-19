const { col } = require('../config/db')
const models = require('../models')

class RequestController {
    async getAll(req, res, next) {
        const data = await models.requests.findAll({
            attributes: [
                'id',
                'quantity',
                'done',
                [col('client.name'), 'clientName'],
                [col('product.name'), 'productName'],
            ],
            include: [
                {
                    attributes: [],
                    model: models.clients,
                },
                {
                    attributes: [],
                    model: models.products,
                },
            ],
            raw: true,
        })

        const result = data.reduce((acc, row) => {
            console.log(row)
            const existingClient = acc.find((item) => item.name === row.clientName && item.done === row.done)

            existingClient
                ? (existingClient.products.push({ productName: row.productName, quantity: row.quantity }),
                  (existingClient.total += row.quantity))
                : acc.push({
                      name: row.clientName,
                      products: [{ productName: row.productName, quantity: row.quantity }],
                      done: row.done,
                      total: row.quantity,
                  })

            return acc
        }, [])

        return res.json(result)
    }

    async createRequest(req, res, next) {
        await models.requests.create({
            clientName: 'Bakhtiyar',
            breadType: 'Домашний',
            quantity: 50,
            done: true,
        })
        //TODO: Возвращать данные о созданном request
        return res.status(200).send('Request Created')
    }
}

module.exports = new RequestController()
