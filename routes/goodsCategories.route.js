const { Router } = require('express')

const Controller = require('../controllers/goodsCategories.controller')
const catchAsync = require('../filters/catchAsync')

const router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.create))
router.put('/:id', catchAsync(Controller.update))
router.delete('/:id', catchAsync(Controller.delete))

module.exports = router
