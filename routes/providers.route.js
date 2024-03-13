const { Router } = require('express')

const Controller = require('../controllers/providers.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAllProviders))

module.exports = router
