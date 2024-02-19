const { Router } = require('express')

const Controller = require('../controllers/sales.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createSale))
router.put('/:id', catchAsync(Controller.updateSale))
router.delete('/:id', catchAsync(Controller.deleteSale))
router.get('/:id', catchAsync(Controller.getOrderById))

module.exports = router
