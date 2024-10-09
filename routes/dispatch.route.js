const { Router } = require('express')

const Controller = require('../controllers/dispatch.controller')
const { route } = require('./user.route')
const catchAsync = require('../filters/catchAsync')

const router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createDispatch))
router.get('/invoice', catchAsync(Controller.getInvoiceData))
router.put('/:id', catchAsync(Controller.updateDispatch))
router.put('/delete/:id', catchAsync(Controller.deleteDispatch))

module.exports = router
