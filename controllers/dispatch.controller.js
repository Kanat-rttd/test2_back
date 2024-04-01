const { col } = require('../config/db')
const models = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')
const AppError = require('../filters/appError')
const Sequelize = require('../config/db')

class DispatchController {
    async getAll(req, res, next) {
        const dispatch = await models.goodsDispatch.findAll({
            attributes: ['id', 'clientId', 'createdAt', 'dispatch'],
            include: [
                {
                    model: models.goodsDispatchDetails,
                    attributes: ['id', 'productId', 'quantity', 'price'],
                    include: [
                        {
                            model: models.products,
                            attributes: ['name', 'price'],
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
        })

        // console.log(new Date().toLocaleTimeString())

        res.status(200).json(dispatch)
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
            order: [['createdAt', 'ASC']], // Order by createdAt ascending
        })

        // Группировка по дате создания и clientId, объединение продуктов
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

        // Преобразование объекта в массив значений
        const result = Object.values(groupedDispatch)

        res.status(200).json(result)
    }

    //     async createDispatch(req, res, next) {
    //         const dispatchData = req.body

    //         // Проверяем наличие записи для данного пользователя на текущий день
    //         const existingDispatch = await models.goodsDispatch.findOne({
    //             where: {
    //                 clientId: dispatchData.userId,
    //                 createdAt: {
    //                     [Op.gte]: moment().startOf('day').toDate(), // Начало текущего дня
    //                     [Op.lt]: moment().endOf('day').toDate(), // Конец текущего дня
    //                 },
    //             },
    //         })

    //         if (existingDispatch) {
    //             // Если запись существует, обновляем её
    //             await existingDispatch.update({
    //                 dispatch: dispatchData.dispatch,
    //             })

    //             // Обновляем детали отгрузки
    //             await Promise.all(
    //                 dispatchData.products.map(async (sale) => {
    //                     const existingDetail = await models.goodsDispatchDetails.findOne({
    //                         where: {
    //                             goodsDispatchId: existingDispatch.id,
    //                             productId: sale.id,
    //                         },
    //                     })

    //                     if (existingDetail) {
    //                         // Если деталь существует, добавляем к текущему количеству новое количество
    //                         await existingDetail.update({
    //                             quantity: existingDetail.quantity + sale.quantity,
    //                         })
    //                     } else {
    //                         // Если деталь не существует, создаем новую
    //                         await models.goodsDispatchDetails.create({
    //                             goodsDispatchId: existingDispatch.id,
    //                             productId: sale.id,
    //                             quantity: sale.quantity,
    //                         })
    //                     }
    //                 }),
    //             )

    //             res.status(200).json({
    //                 status: 'success',
    //                 message: 'Заказ успешно обновлен',
    //             })
    //         } else {
    //             // Если запись не существует, создаем новую
    //             const dispatch = await models.goodsDispatch.create({
    //                 clientId: dispatchData.userId,
    //                 dispatch: dispatchData.dispatch,
    //             })

    //             // Создаем детали отгрузки для новой записи
    //             const dispatchDetails = dispatchData.products.map((sale) => ({
    //                 goodsDispatchId: dispatch.id,
    //                 productId: sale.id,
    //                 quantity: sale.quantity,
    //             }))

    //             await models.goodsDispatchDetails.bulkCreate(dispatchDetails)

    //             res.status(200).json({
    //                 status: 'success',
    //                 message: 'Заказ успешно создан',
    //             })
    //         }
    //     }
}

module.exports = new DispatchController()
