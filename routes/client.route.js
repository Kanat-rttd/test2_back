const { Router } = require('express')

const Controller = require('../controllers/client.controller')
const { route } = require('./user.route')
const catchAsync = require('../filters/catchAsync')
const validateClient = require('../middleware/validateClient')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', validateClient, catchAsync(Controller.createClient))
router.put('/:id', catchAsync(Controller.updateClient))
router.post('/find', catchAsync(Controller.findByFilters))
router.delete('/:id', catchAsync(Controller.deleteClient))

module.exports = router
