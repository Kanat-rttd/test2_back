const models = require('../models')

class RawMaterialsController {
    async getAllRawMaterials(req, res, next) {
        const data = await models.rawMaterials.findAll({
            attributes: ['id', 'name', 'uom'],
        })
        // console.log(data)
        return res.json(data)
    }
}

module.exports = new RawMaterialsController()
