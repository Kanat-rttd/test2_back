const { Op } = require('sequelize')
const models = require('../models')
const sequelize = require('../config/db')

class PlaceController {
    async getAll(req, res, next) {
        try {
            const data = await models.place.findAll({
                attributes: [[sequelize.col('name'), 'label']],
            })
            return res.json(data)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new PlaceController()
