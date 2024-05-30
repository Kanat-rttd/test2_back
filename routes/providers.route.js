const { Router } = require('express')

const Controller = require('../controllers/providers.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAllProviders))
router.post('/', catchAsync(Controller.createProvider))
router.put('/:id', catchAsync(Controller.updateProvider))
router.delete('/:id', catchAsync(Controller.deleteProvider))

module.exports = router
