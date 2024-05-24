const { Router } = require('express')

const Controller = require('../controllers/shiftAccounting.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createShiftAccounting))
// router.get('/invoice', catchAsync(Controller.getInvoiceData))

module.exports = router
