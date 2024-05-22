const { Router } = require('express')
const Controller = require('../controllers/baking.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createBaking))
router.put('/:id', catchAsync(Controller.updateBaking))
router.delete('/:id', catchAsync(Controller.deleteBaking))

module.exports = router
