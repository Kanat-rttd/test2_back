const { Router } = require('express')

const Controller = require('../controllers/providerGoods.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createProviderGoods))
// router.put('/:id', catchAsync(Controller.updatePurchase))

module.exports = router
