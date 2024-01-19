const { Op } = require('sequelize')
const models = require('../models')

class ProductController {
    async getAll(req, res, next) {
        const data = await models.products.findAll({
            attributes: ['id', 'name', 'bakeryType'],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
            },
        })
        return res.json(data)
    }

    async createProduct(req, res, next) {
        const { name, bakeryType } = req.body
        await models.products.create({
            name: name,
            bakeryType: bakeryType,
        })
        //TODO: На фронт можно вернуть сообщение с ключом message и новый продукт для взаимодействия
        return res.status(200).send('Product Created')
    }

    async updateProduct(req, res, next) {
        const { id } = req.params
        console.log(id)
        const { name, bakeryType } = req.body
        await models.products.update(
            {
                name,
                bakeryType,
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
        return res.status(200).json({ id: id })
    }
}

module.exports = new ProductController()
