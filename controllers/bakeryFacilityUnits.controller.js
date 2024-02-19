const models = require('../models')

class BakeryFacilityUnitsController {
    async getAll(req, res, next) {
        const data = await models.bakingFacilityUnits.findAll({
            attributes: ['id', 'facilityUnit'],
        })
        console.log(data)
        return res.json(data)
    }
}

module.exports = new BakeryFacilityUnitsController()
