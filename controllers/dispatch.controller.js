const { col } = require('../config/db')
const models = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')
const AppError = require('../filters/appError')
const Sequelize = require('../config/db')
const dayjs = require('dayjs')

class DispatchController {
    async getAll(req, res, next) {
        const { startDate, endDate, facilityUnit, client, product, status } = req.query

        const filterOptions = {}
        const facilityOptions = {}
        const clientOptions = {}
        const productOptions = {}

        const dateFrom = dayjs(startDate).add(-1, 'day')
        const dateTo = dayjs(endDate)

        if (startDate && endDate) {
            filterOptions.createdAt = {
                [Op.between]: [
                    dayjs(dateFrom).set('hours', 14).format('YYYY-MM-DD HH:mm:ss'),
                    dayjs(dateTo).set('hours', 14).format('YYYY-MM-DD HH:mm:ss'),
                ],
            }
        }

        if (status) {
            filterOptions.dispatch = status
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
        const { clientId, dispatch, products } = req.body

        const createdDispatch = await models.goodsDispatch.create({
            clientId,
            dispatch,
        })

        const clientPrices = await models.individualPrices.findAll({
            where: { clientId, isDeleted: false },
            raw: true,
        })

        console.log(clientPrices)

        const dispatchDetails = products.map((sale) => {
            console.log(sale.productId)
            const finded = clientPrices.find((price) => price.productId == sale.productId)
            console.log(finded)
            return {
                goodsDispatchId: createdDispatch.id,
                productId: sale.productId,
                quantity: sale.quantity,
                price: finded ? finded.price : sale.productPrice,
            }
        })

        await models.goodsDispatchDetails.bulkCreate(dispatchDetails)

        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно создан',
        })
    }

    async getInvoiceData(req, res, next) {
        const { clientId, startDate, endDate, status } = req.query

        let filterOptions = {}

        const dateFrom = dayjs(startDate).add(-1, 'day')
        const dateTo = dayjs(endDate)

        if (startDate && endDate) {
            filterOptions.createdAt = {
                [Op.between]: [
                    dayjs(dateFrom).set('hours', 14).format('YYYY-MM-DD HH:mm:ss'),
                    dayjs(dateTo).set('hours', 14).format('YYYY-MM-DD HH:mm:ss'),
                ],
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
                    createdAt:
                        new Date(curr.createdAt).getTime() >= new Date(curr.createdAt).setHours(14, 0, 0, 0) &&
                        new Date(curr.createdAt).getTime() <= new Date(curr.createdAt).setHours(23, 59, 59, 999)
                            ? dayjs(curr.createdAt).add(-1, 'day')
                            : curr.createdAt,
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
                        price: detail.price,
                        quantity: detail.quantity,
                        totalPrice: detail.quantity * detail.price,
                    })
                } else {
                    acc[key].totalProducts[foundIndex].quantity += detail.quantity
                    acc[key].totalProducts[foundIndex].totalPrice += detail.quantity * detail.price
                }

                acc[key].totalSum += detail.quantity * detail.price
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
            { where: { id } },
        )

        const orderDetails = products.map((sale) => ({
            goodsDispatchId: id,
            productId: sale.productId,
            quantity: sale.quantity,
            price: sale.price,
        }))
        await models.goodsDispatchDetails.destroy({ where: { goodsDispatchId: id } })
        await models.goodsDispatchDetails.bulkCreate(orderDetails)

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
