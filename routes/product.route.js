const { Router } = require('express')
const Controller = require('../controllers/product.controller')
const roleCheck = require('../middleware/roleCheck')
const catchAsync = require('../filters/catchAsync')
let router = Router()
router.get('/', catchAsync(Controller.getAll))
router.use(roleCheck('Admin'))
router.post('/', catchAsync(Controller.createProduct))
router.put('/:id', catchAsync(Controller.updateProduct))
router.delete('/:id', catchAsync(Controller.deleteProduct))

module.exports = router
