const { Router } = require('express')

const Controller = require('../controllers/shiftAccounting.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createShiftAccounting))
router.put('/:id', catchAsync(Controller.updateShiftAccounting))
router.put('/delete/:id', catchAsync(Controller.deleteShiftAccounting))

module.exports = router
