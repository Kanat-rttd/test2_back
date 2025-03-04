const { Router } = require('express')

const Controller = require('../controllers/overPrice.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createOverPrice))
router.put('/:id', catchAsync(Controller.updateOverPrice))
router.delete('/:id', catchAsync(Controller.delOverPrice))
router.get('/clientFilter', catchAsync(Controller.getClientsForFilter))

module.exports = router
