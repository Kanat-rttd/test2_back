const { Op } = require('sequelize')
const models = require('../models')
class ProductController {
    async getAll(req, res, next) {
        const data = await models.products.findAll({
            attributes: ['id', 'name', 'price', 'costPrice', 'status'],
            include: [
                {
                    attributes: ['facilityUnit', 'id'],
                    model: models.bakingFacilityUnits,
                },
            ],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
            },
        })
        return res.json(data)
    }

    async createProduct(req, res, next) {
        const { name, bakingFacilityUnitId, price, costPrice, status } = req.body

        await models.products.create({
            name,
            bakingFacilityUnitId,
            price,
            costPrice,
            status,
        })

        return res.status(200).send('Product Created')
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
        // console.log(id)
        const { name, bakingFacilityUnitId, price, costPrice, status } = req.body
        await models.products.update(
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
            },
        )
        return res.status(200).send('Product updated')
    }

    async deleteProduct(req, res, next) {
        const { id } = req.params
        await models.products.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).json({
            status: 'success',
            message: 'Product deleted',
        })
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
