const { col } = require('../config/db')
const models = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')
const AppError = require('../filters/appError')
const Sequelize = require('../config/db')

class DispatchController {
    async getAll(req, res, next) {
        const { startDate, endDate, facilityUnit, client, product } = req.query
        console.log('______________________________')
        console.log('Received query parameters:', startDate, endDate, facilityUnit, client, product)

        const filterOptions = {}
        const facilityOptions = {}
        const clientOptions = {}
        const productOptions = {}
        if (startDate && endDate) {
            filterOptions.createdAt = {
                [Op.between]: [new Date(startDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)],
            }
        }

        if (client) {
            clientOptions.name = client
        }

        if (product) {
            productOptions.name = product
        }

        if (facilityUnit) {
            facilityOptions.id = facilityUnit
        }

        let totalQuantity = 0
        let totalPrice = 0

        const dispatch = await models.goodsDispatch.findAll({
            attributes: ['id', 'clientId', 'createdAt', 'dispatch'],
            include: [
                {
                    model: models.goodsDispatchDetails,
                    attributes: ['id', 'productId', 'quantity', 'price'],
                    required: true,
                    include: [
                        {
                            model: models.products,
                            attributes: ['name', 'price'],
                            where: productOptions,
                            required: true,
                            include: [
                                {
                                    model: models.bakingFacilityUnits,
                                    attributes: ['id', 'facilityUnit'],
                                    where: facilityOptions,
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
                {
                    model: models.clients,
                    attributes: ['id', 'name'],
                    where: clientOptions,
                    required: true,
                },
            ],
            required: true,
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
        })

        dispatch.forEach((dispatchItem) => {
            if (!dispatchItem.dispatch) {
                const dispatchDetails = dispatchItem.goodsDispatchDetails

                dispatchDetails.forEach((detail) => {
                    if (detail.price !== null) {
                        totalPrice += detail.quantity * detail.price
                    } else {
                        totalPrice += detail.quantity * detail.product.price
                    }

                    totalQuantity += detail.quantity
                })
            }
        })

        console.log(totalQuantity, totalPrice)

        res.status(200).json({
            data: dispatch,
            totalPrice: totalPrice,
            totalQuantity: totalQuantity,
        })
    }

    async createDispatch(req, res, next) {
        const dispatchData = req.body

        const dispatch = await models.goodsDispatch.create({
            clientId: dispatchData.userId,
            dispatch: dispatchData.dispatch,
        })

        const dispatchDetails = dispatchData.products.map((sale) => ({
            goodsDispatchId: dispatch.id,
            productId: sale.id,
            quantity: sale.quantity,
        }))

        await models.goodsDispatchDetails.bulkCreate(dispatchDetails)

        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно создан',
        })
    }

    async getInvoiceData(req, res, next) {
        const { clientId, startDate, endDate, status } = req.query

        let filterOptions = {}

        if (startDate && endDate) {
            if (startDate == endDate) {
                const newDate = new Date(startDate)

                const endDate = new Date(newDate.getTime() + (23 * 60 * 60 * 1000 + 59 * 60 * 1000))

                filterOptions.createdAt = {
                    [Op.between]: [newDate, endDate],
                }
            } else {
                filterOptions.createdAt = {
                    [Op.between]: [startDate, endDate],
                }
            }
        }

        if (clientId) {
            filterOptions.clientId = clientId
        }

        console.log(filterOptions)

        const dispatch = await models.goodsDispatch.findAll({
            attributes: ['id', 'clientId', 'createdAt', 'dispatch'],
            include: [
                {
                    model: models.invoiceData,
                    attributes: ['invoiceNumber'],
                    as: 'invoiceData',
                },
                {
                    model: models.goodsDispatchDetails,
                    attributes: ['id', 'productId', 'quantity', 'price'],
                    include: [
                        {
                            model: models.products,
                            attributes: ['id', 'name', 'price'],
                            include: [
                                {
                                    model: models.bakingFacilityUnits,
                                    attributes: ['id', 'facilityUnit'],
                                },
                            ],
                        },
                    ],
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
            order: [['createdAt', 'ASC']],
        })

        const groupedDispatch = dispatch.reduce((acc, curr) => {
            const key = `${curr.createdAt.getFullYear()}-${curr.createdAt.getMonth() + 1}-${curr.createdAt.getDate()}-${
                curr.clientId
            }`
            if (!acc[key]) {
                acc[key] = {
                    createdAt: curr.createdAt,
                    clientId: curr.clientId,
                    clientName: curr.client.name,
                    invoiceNumber: curr.invoiceData.invoiceNumber,
                    totalProducts: [],
                    totalSum: 0,
                    dispatches: [],
                }
            }

            curr.goodsDispatchDetails.forEach((detail) => {
                const foundIndex = acc[key].totalProducts.findIndex((product) => product.id === detail.productId)
                if (foundIndex === -1) {
                    acc[key].totalProducts.push({
                        id: detail.productId,
                        name: detail.product.name,
                        price: detail.product.price,
                        quantity: detail.quantity,
                        totalPrice: detail.quantity * detail.product.price,
                    })
                } else {
                    acc[key].totalProducts[foundIndex].quantity += detail.quantity
                    acc[key].totalProducts[foundIndex].totalPrice += detail.quantity * detail.product.price
                }

                acc[key].totalSum += detail.quantity * detail.product.price
            })

            acc[key].dispatches.push(curr)
            return acc
        }, {})

        const result = Object.values(groupedDispatch)

        res.status(200).json(result)
    }

    async updateDispatch(req, res, next) {
        const { id } = req.params

        const { products, clientId } = req.body

        const response = await models.goodsDispatch.update(
            {
                clientId,
            },
            { where: { id }},
        )

        const orderDetails = products.map((sale) => ({
            id,
            productId: sale.productId,
            quantity: sale.quantity,
            price: sele.price,
        }))

        await models.goodsDispatchDetails.update(orderDetails, {
            where: {
                id,
            },
        })

        return res.status(200).json({ message: 'Dispatch updated', data: response })
    }

    async deleteDispatch(req, res) {
        const { id } = req.params

        const deletedDispatch = await models.goodsDispatch.update(
            { isDeleted: true },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).json({ message: 'Поставщик товара успешно удален' })
    }
}

module.exports = new DispatchController()
