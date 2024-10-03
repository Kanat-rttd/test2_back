const { Router } = require('express')
const Controller = require('../controllers/spreadsheet.controller')
const catchAsync = require('../filters/catchAsync')

const router = Router()

router.post('/export', catchAsync(Controller.createWorkBook))

module.exports = router
