const { Router } = require('express')
const Controller = require('../controllers/product.controller')

let router = Router()

router.get('/', Controller.getAll)
router.post('/', Controller.createProduct)
router.put('/:id', Controller.updateProduct)
router.delete('/:id', Controller.deleteProduct)

module.exports = router
