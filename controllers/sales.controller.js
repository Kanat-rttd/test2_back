const models = require('../models')
const { Op } = require('sequelize')

class SalesController {
    async getByClient(req, res) {
        const { startDate, endDate, facilityUnitId } = req.query
        const { clientId } = req.user

        let facilityFilterOptions = {}
        let filterOptions = {}

        if (clientId) {
            filterOptions.clientId = {
                [Op.eq]: clientId,
            }
        }

        if (facilityUnitId) {
            facilityFilterOptions.id = facilityUnitId
        }

        if (startDate && endDate) {
            filterOptions.date = {
                [Op.between]: [new Date(startDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)],
            }
        }

        const orders = await models.order.findAll({
            attributes: ['id', 'userId', 'totalQuantity', 'createdAt', 'done', 'date'],
            required: true,
            include: [
                {
                    model: models.orderDetails,
                    attributes: [['id', 'orderDetailsId'], 'productId', 'orderedQuantity'],
                    required: true,
                    include: [
                        {
                            model: models.products,
                            attributes: ['name', 'price'],
                            required: true,
                            include: [
                                {
                                    model: models.bakingFacilityUnits,
                                    attributes: ['id', 'facilityUnit'],
                                    where: facilityFilterOptions,
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    model: models.users,
                    attributes: ['id', 'name'],
                },
                {
                    model: models.clients,
                    attributes: ['id', 'name'],
                },
            ],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
            order: [['id', 'DESC']],
        })

        res.status(200).json(orders)
    }

    async getAll(req, res) {
        const { startDate, endDate, facilityUnitId } = req.query

        let facilityFilterOptions = {}
        let filterOptions = {}

        if (facilityUnitId) {
            facilityFilterOptions.id = facilityUnitId
        }

        if (startDate && endDate) {
            filterOptions.date = {
                [Op.between]: [new Date(startDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)],
            }
        }

        const orders = await models.order.findAll({
            attributes: ['id', 'userId', 'totalQuantity', 'createdAt', 'done', 'date'],
            required: true,
            include: [
                {
                    model: models.orderDetails,
                    attributes: [['id', 'orderDetailsId'], 'productId', 'orderedQuantity'],
                    required: true,
                    include: [
                        {
                            model: models.products,
                            attributes: ['name', 'price'],
                            required: true,
                            include: [
                                {
                                    model: models.bakingFacilityUnits,
                                    attributes: ['id', 'facilityUnit'],
                                    where: facilityFilterOptions,
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    model: models.users,
                    attributes: ['id', 'name'],
                },
                {
                    model: models.clients,
                    attributes: ['id', 'name'],
                },
            ],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
            order: [['id', 'DESC']],
        })

        res.status(200).json(orders)
    }

    async getOrderById(req, res) {
        const { id } = req.params

        const orders = await models.order.findOne({
            attributes: ['id', 'userId', 'totalQuantity', 'createdAt'],
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

    async createSale(req, res) {
        const sales = req.body

        console.log(sales)

        const order = await models.order.create({
            clientId: sales.clientId,
            date: sales.date,
            totalQuantity: sales.products.reduce((acc, sale) => acc + Number(sale.orderedQuantity), 0),
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

    async updateSale(req, res) {
        const { id } = req.params
        const sales = req.body

        const today = new Date()
        today.setHours(11, 0, 0, 0)

        await models.order.update(
            {
                clientId: sales.clientId,
                date: sales.date,
                totalQuantity: sales.products.reduce((acc, sale) => acc + Number(sale.orderedQuantity), 0),
            },
            { where: { id } },
        )

        const orderDetails = sales.products.map((sale) => ({
            orderId: id,
            productId: sale.productId,
            orderedQuantity: sale.orderedQuantity,
        }))

        models.orderDetails.destroy({ where: { orderId: id } }).then(async () => {
            await models.orderDetails.bulkCreate(orderDetails)
        })

        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно обновлен',
        })
    }

    async deleteSale(req, res) {
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

    async setDoneStatus(req, res) {
        const { id } = req.params
        // console.log(id)

        await models.order.update(
            {
                done: 1,
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

    async getByFacilityUnit(req, res) {
        const { facilityUnitId } = req.body

        const orders = await models.order.findAll({
            attributes: ['id', 'userId', 'totalQuantity', 'createdAt', 'done'],
            include: [
                {
                    model: models.orderDetails,
                    attributes: [['id', 'orderDetailsId'], 'productId', 'orderedQuantity'],
                    include: [
                        {
                            model: models.products,
                            attributes: ['name', 'price'],
                            include: [
                                {
                                    model: models.bakingFacilityUnits,
                                    attributes: ['id', 'facilityUnit'],
                                    where: {
                                        id: facilityUnitId,
                                    },
                                    as: 'bakingFacilityUnit',
                                },
                            ],
                        },
                    ],
                    where: {},
                },
                {
                    model: models.users,
                    attributes: ['id', 'name'],
                },
            ],
            where: {
                '$orderDetails.product.bakingFacilityUnit.id$': facilityUnitId,
            },
        })

        res.status(200).json({
            status: 'success',
            data: orders,
        })
    }

    async saveOrderChanges(req, res) {
        const orders = req.body

        for (const order of orders) {
            const { orderDetailsId, productId, orderedQuantity } = order

            await models.orderDetails.update(
                {
                    orderedQuantity,
                },
                {
                    where: {
                        id: orderDetailsId,
                        productId: productId,
                    },
                },
            )
        }

        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно обновлен',
        })
    }
}

module.exports = new SalesController()
