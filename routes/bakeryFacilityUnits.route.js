const { Router } = require('express')
const Controller = require('../controllers/bakeryFacilityUnits.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createFacilityUnit))

module.exports = router
