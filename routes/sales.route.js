const { Router } = require('express')
const getUser = require('../middleware/getUser')

const Controller = require('../controllers/sales.controller')
const catchAsync = require('../filters/catchAsync')

const router = Router()

router.get('/', getUser, catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createSale))
router.put('/:id', catchAsync(Controller.updateSale))
router.delete('/:id', catchAsync(Controller.deleteSale))
router.get('/:id', catchAsync(Controller.getOrderById))
router.put('/status/:id', catchAsync(Controller.setDoneStatus))
router.post('/status/test', catchAsync(Controller.getByFacilityUnit))
router.put('/order/:id', catchAsync(Controller.saveOrderChanges))

module.exports = router
