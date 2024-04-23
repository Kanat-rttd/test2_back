const { Router } = require('express')
const Controller = require('../controllers/departPersonal.controller')
const catchAsync = require('../filters/catchAsync')
let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createDepartPersonal))
router.put('/:id', catchAsync(Controller.updateDepartPersonal))

module.exports = router
