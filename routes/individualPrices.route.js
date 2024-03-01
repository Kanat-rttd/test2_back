const { Router } = require('express')
const Controller = require('../controllers/individualPrices.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createIndividualPrice))

module.exports = router
