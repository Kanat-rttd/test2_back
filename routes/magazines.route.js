const { Router } = require('express')

const Controller = require('../controllers/magazines.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createMagazine))
router.put('/:id', catchAsync(Controller.updateMagazine))
router.delete('/:id', catchAsync(Controller.deleteMagazine))

module.exports = router
