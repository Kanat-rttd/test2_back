const models = require('../models')
const { Op } = require('sequelize')

class AdjustmentController {
    async getAll(req, res) {
        const { startDate, endDate, goodsCategoryId } = req.query

        const filterOptions = {}

        if (startDate && endDate) {
            filterOptions.adjustedDate = {
                [Op.between]: [new Date(startDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)],
            }
        }

        if (goodsCategoryId) {
            filterOptions.goodsCategoryId = { [Op.eq]: goodsCategoryId }
        }

        const data = await models.adjustments.findAll({
            attributes: ['quantity', 'goodsCategoryId', 'createdAt', 'comment'],
            include: [
                {
                    model: models.goodsCategories,
                    attributes: ['id', 'category', 'unitOfMeasure'],
                },
            ],
            where: filterOptions,
        })

        return res.json(data)
    }

    async createAdjustment(req, res) {
        const adjustmentData = req.body

        console.log(adjustmentData)

        const createdAdjustment = await models.adjustments.create({
            goodsCategoryId: adjustmentData.item.id,
            quantity: adjustmentData.qty,
            comment: adjustmentData.Comment,
        })

        return res.status(200).json({ message: 'Корректировка успешно создана', data: createdAdjustment })
    }
}

module.exports = new AdjustmentController()
