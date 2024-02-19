const { Router } = require('express')
const Controller = require('../controllers/baking.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createBaking))

module.exports = router
