const { Router } = require('express')

const Controller = require('../controllers/finance.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/arrival', catchAsync(Controller.createArrival))
router.post('/consumption', catchAsync(Controller.createConsumption))
router.post('/transfer', catchAsync(Controller.createTransfer))

module.exports = router
