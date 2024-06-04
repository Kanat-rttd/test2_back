const models = require('../models')

class AdjustmentController {
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
