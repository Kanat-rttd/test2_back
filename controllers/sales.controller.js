const { col } = require('../config/db')
const models = require('../models')
const { Op } = require('sequelize')
const AppError = require('../filters/appError')

class SalesController {
    async getAll(req, res, next) {
        const orders = await models.order.findAll({
            attributes: ['id', 'userId', 'totalPrice', 'createdAt'],
            include: [
                {
                    model: models.orderDetails,
                    attributes: [['id', 'orderDetailsId'], 'productId'],
                    include: [
                        {
                            model: models.products,
                            attributes: ['name', 'price'],
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

    async getOrderById(req, res, next) {
        const { id } = req.params

        const orders = await models.order.findOne({
            attributes: ['id', 'userId', 'totalPrice', 'createdAt'],
            include: [
                {
                    model: models.orderDetails,
                    attributes: [['id', 'orderDetailsId'], 'productId', 'orderedQuantity'],
                    include: [
                        {
                            model: models.products,
                            attributes: ['name', 'price'],
                        },
                    ],
                },
            ],
            where: { id: id },
        })

        res.status(200).json({
            status: 'success',
            data: orders,
        })
    }

    async createSale(req, res, next) {
        const sales = req.body

        const order = await models.order.create({
            userId: sales.clientId,
            totalPrice: sales.products.reduce((acc, sale) => acc + sale.price, 0),
        })

        const orderDetails = sales.products.map((sale) => ({
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
        const { editedOrders, deletedOrderIds } = req.body

        const today = new Date()
        today.setHours(11, 0, 0, 0)

        // Update edited orders
        const updatePromises = editedOrders.map(async (editedOrder) => {
            const { orderId, sale } = editedOrder
            return models.orderDetails.update(
                { sale },
                {
                    where: {
                        id: orderId,
                        editableUntil: {
                            [Op.lt]: today,
                        },
                    },
                },
            )
        })

        const deletePromises = deletedOrderIds.map(async (orderId) => {
            return models.orderDetails.destroy({
                where: {
                    id: orderId,
                    editableUntil: {
                        [Op.lt]: today,
                    },
                },
            })
        })

        try {
            const [updateResults, deleteResults] = await Promise.all([
                Promise.all(updatePromises),
                Promise.all(deletePromises),
            ])

            if (updateResults.some((result) => result[0] === 0) || deleteResults.some((result) => result === 0)) {
                return next(new AppError('Нельзя изменить заказ', 400))
            }

            res.status(200).json({
                status: 'success',
                message: 'Заказ успешно обновлен',
            })
        } catch (error) {
            return next(new AppError('Ошибка при обновлении заказа', 500))
        }
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
