const { Router } = require('express')

const Controller = require('../controllers/financeAccount.controller.js')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAll))

module.exports = router
