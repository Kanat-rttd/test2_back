const { Router } = require('express')
const Controller = require('../controllers/request.controller')
const catchAsync = require('../filters/catchAsync')
let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createRequest))

module.exports = router
