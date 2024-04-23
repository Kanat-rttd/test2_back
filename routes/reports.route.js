const { Router } = require('express')

const Controller = require('../controllers/report.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/bread', catchAsync(Controller.breadViewReport))
router.get('/time', catchAsync(Controller.shiftTimeView))

module.exports = router
