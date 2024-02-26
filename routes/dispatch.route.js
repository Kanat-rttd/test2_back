const { Router } = require('express')

const Controller = require('../controllers/dispatch.controller')
const { route } = require('./user.route')
const catchAsync = require('../filters/catchAsync')

let router = Router()

// router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createDispatch))

module.exports = router
