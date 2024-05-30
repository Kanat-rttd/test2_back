const { Router } = require('express')

const Controller = require('../controllers/contragent.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createContragent))
router.put('/:id', catchAsync(Controller.updateContragent))
router.delete('/:id', catchAsync(Controller.deleteContragent))

module.exports = router
