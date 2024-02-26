const { Router } = require('express')

const Controller = require('../controllers/client.controller')
const { route } = require('./user.route')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createClient))
router.put('/:id', catchAsync(Controller.updateClient))
router.post('/find', catchAsync(Controller.findByFilters))

module.exports = router
