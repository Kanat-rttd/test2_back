const { Router } = require('express')
const Controller = require('../controllers/product.controller')
const roleCheck = require('../middleware/roleCheck')

let router = Router()
router.get('/', Controller.getAll)
router.use(roleCheck('Admin'))
router.post('/', Controller.createProduct)
router.put('/:id', Controller.updateProduct)
router.delete('/:id', Controller.deleteProduct)

module.exports = router
