const models = require('../models')

class AdjustmentController {
    async getAll(req, res, next) {
        const { startDate, endDate, providerGoodId } = req.query

        const filterOptions = {}

        if (startDate && endDate) {
            filterOptions.adjustedDate = {
                [Op.between]: [new Date(startDate).setHours(0, 0, 0, 0), new Date(endDate).setHours(23, 59, 59, 999)],
            }
        }

        if (providerGoodId) {
            filterOptions.providerGoodId = providerGoodId
        }

        const data = await models.adjustments.findAll({
            attributes: ['quantity', 'goodsCategoryId', 'createdAt'],
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

    async createAdjustment(req, res, next) {
        const adjustmentData = req.body

        console.log(adjustmentData)

        const createdAdjustment = await models.adjustments.create({
            providerGoodId: adjustmentData.item.id,
            quantity: adjustmentData.qty,
            comment: adjustmentData.Comment,
        })

        return res.status(200).json({ message: 'Корректировка успешно создана', data: createdAdjustment })
    }
}

module.exports = new AdjustmentController()
