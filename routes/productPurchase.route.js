const { Router } = require('express')

const Controller = require('../controllers/productPurchase.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAllPruchases))
router.post('/', catchAsync(Controller.createPurchase))
router.get('/debt', catchAsync(Controller.getDebtPurchases))
router.put('/:id', catchAsync(Controller.updatePurchase))

module.exports = router
