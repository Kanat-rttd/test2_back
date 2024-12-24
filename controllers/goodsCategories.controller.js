const models = require('../models')

class GoodsCategories {
    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async getAll(req, res, next) {
        const { categoryId } = req.query

        let filterOptions = {}

        if (categoryId) {
            filterOptions.id = categoryId
        }
        const data = await models.goodsCategories.findAll({
            where: { ...filterOptions },
        })
        return res.json(data)
    }

    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async create(req, res) {
        const { category, unitOfMeasure } = req.body

        const goodsCategory = await models.goodsCategories.create({
            category,
            unitOfMeasure,
        })

        return res.status(200).json({
            message: 'Категория успешно создана',
            goodsCategory,
        })
    }

    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async update(req, res) {
        const { id } = req.params
        const { category, unitOfMeasure } = req.body

        await models.goodsCategories.update(
            { category, unitOfMeasure },
            {
                where: { id },
            },
        )

        return res.status(200).json({
            message: 'Категория успешно обновлена',
        })
    }

    /**
     *
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    async delete(req, res) {
        const { id } = req.params

        await models.goodsCategories.destroy({ where: { id } })

        return res.status(200).json({
            message: 'Категория успешно удалена',
        })
    }
}

module.exports = new GoodsCategories()
