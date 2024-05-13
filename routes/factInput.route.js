const { Router } = require('express')

const Controller = require('../controllers/factInput.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createFactInput))
router.put('/:id', catchAsync(Controller.updateFactInput))
router.delete('/:id', catchAsync(Controller.deleteFactInput))

module.exports = router
