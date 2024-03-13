const models = require('../models')

class BakeryFacilityUnitsController {
    async getAll(req, res, next) {
        const data = await models.bakingFacilityUnits.findAll({
            attributes: ['id', 'facilityUnit'],
        })
        //console.log(data)
        return res.json(data)
    }

    async createFacilityUnit(req, res, next) {
        const { facilityUnit } = req.body

        await models.bakingFacilityUnits.create({
            facilityUnit,
        })

        return res.status(200).send('Unit Created')
    }
}

module.exports = new BakeryFacilityUnitsController()
