const { col } = require('../config/db')
const models = require('../models')
const { Op } = require('sequelize')
const AppError = require('../filters/appError')
const dayjs = require('dayjs')

class SalesController {
    async getAll(req, res, next) {
        const { startDate, endDate, facilityUnitId } = req.query

        console.log('Recieved Data ', facilityUnitId)

        let facilityFilterOptions = {}
        let filterOptionsDate = {}

        if (facilityUnitId) {
            facilityFilterOptions.id = facilityUnitId
        }

        if (startDate && endDate) {
            filterOptionsDate.date = {
                [Op.between]: [new Date(startDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)],
            }
        }

        const orders = await models.order.findAll({
            attributes: ['id', 'userId', 'totalQuantity', 'createdAt', 'done'],
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
                ...filterOptionsDate,
            },
        })

        res.status(200).json(orders)
    }

    async getOrderById(req, res, next) {
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

    async createSale(req, res, next) {
        const sales = req.body

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

    async updateSale(req, res, next) {
        const { id } = req.params
        const sales = req.body

        const today = new Date()
        today.setHours(11, 0, 0, 0)

        const order = await models.order.update(
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

    async setDoneStatus(req, res, next) {
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

    async getByFacilityUnit(req, res, next) {
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
}

module.exports = new SalesController()
