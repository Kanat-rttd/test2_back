const { Router } = require('express')

const Controller = require('../controllers/providerGoods.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createProviderGoods))
router.put('/:id', catchAsync(Controller.updateProviderGoods))
router.delete('/:id', catchAsync(Controller.deleteProviderGoods))

module.exports = router
