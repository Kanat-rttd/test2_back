const { col } = require('../config/db')
const models = require('../models')
const { Op } = require('sequelize')
const dayjs = require('dayjs')
const { generateInvoicePdf } = require('../lib/pdf/generateInvoicePdf')

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
            clientOptions.contragentName = client
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
            attributes: ['id', 'contragentId', 'createdAt', 'dispatch'],
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
                    model: models.contragent,
                    attributes: ['id', 'contragentName'],
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

        // console.log(dispatch);

        res.status(200).json({
            data: dispatch,
            totalPrice: totalPrice,
            totalQuantity: totalQuantity,
        })
    }

    async createDispatch(req, res, next) {
        const { contragentId, dispatch, products } = req.body

        const createdDispatch = await models.goodsDispatch.create({
            contragentId,
            dispatch,
        })

        const foundContragent = await models.contragent.findByPk(contragentId)
        const foundClient = await models.clients.findOne({
            where: {
                id: foundContragent.mainId,
            },
        })

        const clientPrices = await models.individualPrices.findAll({
            where: { clientId: foundClient.id, isDeleted: false },
            raw: true,
        })

        const dispatchDetails = products.map((sale) => {
            const found = clientPrices.find((price) => {
                console.log('CREATE_DISPATCH', JSON.stringify({ price: price.productId, sale: sale.productId }))
                return +price.productId === +sale.productId
            })

            console.log('CREATE_DISPATCH', JSON.stringify({ found }))
            return {
                goodsDispatchId: createdDispatch.id,
                productId: sale.productId,
                quantity: sale.quantity,
                price: found ? found.price : sale.productPrice,
            }
        })

        await models.goodsDispatchDetails.bulkCreate(dispatchDetails)

        res.status(200).json({
            status: 'success',
            message: 'Заказ успешно создан',
        })
    }

    async getInvoiceData(req, res, next) {
        const { contragentId, startDate, endDate } = req.query

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

        if (contragentId) {
            filterOptions.contragentId = contragentId
        }

        console.log(filterOptions)

        const dispatch = await models.goodsDispatch.findAll({
            attributes: ['id', 'contragentId', 'createdAt', 'dispatch'],
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
                    model: models.contragent,
                    attributes: ['id', 'contragentName'],
                },
            ],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                dispatch: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
            order: [['createdAt', 'ASC']],
        })

        const groupedDispatch = dispatch.reduce((acc, curr) => {
            const key = `${curr.createdAt.getFullYear()}-${curr.createdAt.getMonth() + 1}-${curr.createdAt.getDate()}-${
                curr.contragentId
            }`
            const createdAt = dayjs(curr.createdAt)
            const startOfDay = dayjs(curr.createdAt).startOf('day').hour(14)
            const endOfDay = dayjs(curr.createdAt).endOf('day').hour(23).minute(59).second(59).millisecond(999)
            if (!acc[key]) {
                acc[key] = {
                    createdAt:
                        createdAt.isAfter(startOfDay) && createdAt.isBefore(endOfDay)
                            ? dayjs(curr.createdAt).add(1, 'day')
                            : curr.createdAt,
                    contragentId: curr.contragentId,
                    contragentName: curr.contragent.contragentName,
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

        const { products, contragentId } = req.body

        const response = await models.goodsDispatch.update(
            {
                contragentId,
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

        await models.goodsDispatch.destroy({
            where: { id },
        })

        return res.status(200).json({ message: 'Поставщик товара успешно удален' })
    }

    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async getInvoicePdf(req, res) {
        const { id } = req.params

        const dispatch = await models.goodsDispatch.findOne({
            attributes: ['id', 'contragentId', 'createdAt', 'dispatch'],
            include: [
                {
                    model: models.invoiceData,
                    attributes: ['invoiceNumber'],
                    as: 'invoiceData',
                    where: {
                        invoiceNumber: id,
                    },
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
                    model: models.contragent,
                    attributes: ['id', 'contragentName'],
                },
            ],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                dispatch: {
                    [Op.ne]: 1,
                },
            },
            order: [['createdAt', 'ASC']],
        })

        const createdAt = dayjs(dispatch.createdAt)
        const startOfDay = dayjs(dispatch.createdAt).startOf('day').hour(14)
        const endOfDay = dayjs(dispatch.createdAt).endOf('day').hour(23).minute(59).second(59).millisecond(999)

        const result = {
            createdAt:
                createdAt.isAfter(startOfDay) && createdAt.isBefore(endOfDay)
                    ? dayjs(dispatch.createdAt).add(1, 'day')
                    : dispatch.createdAt,
            contragentId: dispatch.contragentId,
            contragentName: dispatch.contragent.contragentName,
            invoiceNumber: dispatch.invoiceData.invoiceNumber,
            totalProducts: [],
            totalSum: 0,
        }

        dispatch.goodsDispatchDetails.forEach((detail) => {
            const foundIndex = result.totalProducts.findIndex((product) => product.id === detail.productId)
            if (foundIndex === -1) {
                result.totalProducts.push({
                    id: detail.productId,
                    name: detail.product.name,
                    price: detail.price,
                    quantity: detail.quantity,
                    totalPrice: detail.quantity * detail.price,
                })
            } else {
                result.totalProducts[foundIndex].quantity += detail.quantity
                result.totalProducts[foundIndex].totalPrice += detail.quantity * detail.price
            }

            result.totalSum += detail.quantity * detail.price
        })

        const overPrice = await models.overPrices.findOne({
            where: {
                contragentId: result.contragentId,
            },
        })

        const pdf = await generateInvoicePdf(result, overPrice?.price ?? 0)

        res.contentType('application/pdf')

        pdf.pipe(res)
        pdf.end()
    }

    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async changeDate(req, res) {
        const { newDate } = req.body
        const { startDate, endDate } = req.query

        if (!newDate || !startDate || !endDate) {
            return res.status(400).json({ message: 'Отсутствуют обязательные поля' })
        }

        const dateFrom = dayjs(startDate).add(-1, 'day').set('hours', 14).format('YYYY-MM-DD HH:mm:ss')
        const dateTo = dayjs(endDate)
            .set('hours', 13)
            .set('minutes', 59)
            .set('seconds', 59)
            .set('milliseconds', 99)
            .format('YYYY-MM-DD HH:mm:ss')

        const updates = await models.goodsDispatch.update(
            {
                createdAt: dayjs(newDate).set('hours', 5).format('YYYY-MM-DD HH:mm:ss'),
            },
            {
                where: {
                    createdAt: {
                        [Op.between]: [dateFrom, dateTo],
                    },
                },
                returning: true,
            },
        )

        return res.status(200).json({
            message: 'Вса данные успешно перенесены на новую дату',
            updates,
        })
    }
}

module.exports = new DispatchController()
