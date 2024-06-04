const { Router } = require('express')
const Controller = require('../controllers/adjustment.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.post('/', catchAsync(Controller.createAdjustment))

module.exports = router
