const { Router } = require('express')
const Controller = require('../controllers/product.controller')
const roleCheck = require('../middleware/roleCheck')
const catchAsync = require('../filters/catchAsync')
let router = Router()
router.use(roleCheck('Admin'))
router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createProduct))
router.put('/:id', catchAsync(Controller.updateProduct))
router.delete('/:id', catchAsync(Controller.deleteProduct))
router.post('/find', catchAsync(Controller.findByFilters))
router.get('/bread', catchAsync(Controller.getBreadNames))

module.exports = router
