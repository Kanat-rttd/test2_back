const { Router } = require('express')

const Controller = require('../controllers/debtTransfer.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createDebtTransfer))
router.get('/calculations', catchAsync(Controller.getAllCalculations))

module.exports = router
