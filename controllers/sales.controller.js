const { col } = require('../config/db')
const models = require('../models')

class SalesController {
    async getAll(req, res, next) {
        const orders = await models.order.findAll({
            attributes: ['id', 'clientId', 'totalPrice', 'createdAt'],
            include: [
                {
                    model: models.orderDetails,
                    attributes: ['productId', 'price'],
                    include: [
                        {
                            model: models.products,
                            attributes: ['name'],
                        },
                    ],
                },
            ],
        })

        res.status(200).json({
            status: 'success',
            data: orders,
        })
    }

    async createSale(req, res, next) {
        const sales = req.body

        const order = await models.order.create({
            clientId: sales.clientId,
            totalPrice: sales.product.reduce((acc, sale) => acc + sale.price, 0),
        })

        const orderDetails = sales.product.map((sale) => ({
            orderId: order.id,
            productId: sale.productId,
            orderedQuantity: sale.orderedQuantity,
        }))

        await models.orderDetails.bulkCreate(orderDetails)

        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно создан',
        })
    }

    async editSale(req, res, next) {
        const { id } = req.params
        const sale = req.body

        await models.order.update(
            {
                sale,
            },
            {
                where: {
                    id,
                },
            },
        )

        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно обновлен',
        })
    }

    async deleteSale(req, res, next) {
        const { id } = req.params

        await models.order.update(
            { isDeleted: true },
            {
                where: {
                    id,
                },
            },
        )

        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно удален',
        })
    }
}

module.exports = new SalesController()
