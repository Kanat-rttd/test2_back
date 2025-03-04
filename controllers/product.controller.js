const { Op } = require('sequelize')
const models = require('../models')
class ProductController {
    async getAll(req, res, next) {
        const { name, bakingFacilityUnitId, status } = req.query
        console.log('query Recieved', name, bakingFacilityUnitId, status)
        let filterOptions = {}

        let filterFacility = {}

        if (name) filterOptions.name = name
        if (bakingFacilityUnitId) filterFacility.id = bakingFacilityUnitId
        if (status) filterOptions.status = status

        const data = await models.products.findAll({
            attributes: ['id', 'name', 'price', 'costPrice', 'status'],
            include: [
                {
                    attributes: ['facilityUnit', 'id'],
                    model: models.bakingFacilityUnits,
                    where: filterFacility,
                },
            ],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
        })
        return res.json(data)
    }

    async createProduct(req, res, next) {
        const { name, bakingFacilityUnitId, price, costPrice, status } = req.body

        const createdProduct = await models.products.create({
            name,
            bakingFacilityUnitId,
            price,
            costPrice,
            status,
        })

        return res.status(200).json({ message: 'Продукт успешно создан', data: createdProduct })
    }

    async findByFilters(req, res, next) {
        const { name, bakingFacilityUnitId, status } = req.body

        const filter = {}
        if (name) filter.name = name
        if (bakingFacilityUnitId) filter.bakingFacilityUnitId = bakingFacilityUnitId
        if (status) filter.status = status

        try {
            const result = await models.products.findAll({
                attributes: ['id', 'name', 'price', 'costPrice', 'status'],
                include: [
                    {
                        attributes: ['facilityUnit', 'id'],
                        model: models.bakingFacilityUnits,
                    },
                ],
                where: {
                    ...filter,
                    isDeleted: {
                        [Op.ne]: 1,
                    },
                },
            })
            res.status(200).json({
                status: 'success',
                data: result,
            })
        } catch (error) {
            console.error('Error finding clients:', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }

    async updateProduct(req, res, next) {
        const { id } = req.params
        const { name, bakingFacilityUnitId, price, costPrice, status } = req.body
        const updatedProduct = await models.products.update(
            {
                name,
                bakingFacilityUnitId,
                price,
                costPrice,
                status,
            },
            {
                where: {
                    id,
                },
                individualHooks: true,
            },
        )
        return res.status(200).json({ message: 'Продукт успешно обнавлен', data: updatedProduct })
    }

    async deleteProduct(req, res, next) {
        const { id } = req.params
        const deletedProduct = await models.products.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
            },
        )
        await models.individualPrices.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    productId: id,
                },
            },
        )
        return res.status(200).json({ message: 'Продукт успешно удален', data: deletedProduct })
    }

    async getBreadNames(req, res, next) {
        const products = await models.products.findAll({
            attributes: ['id', 'name'],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
            },
        })

        const data = products.map((product) => {
            return {
                id: product.id,
                bread: product.name,
            }
        })

        return res.json(data)
    }
}

module.exports = new ProductController()
