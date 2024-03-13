const { Router } = require('express')

const Controller = require('../controllers/rawMaterials.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/', catchAsync(Controller.getAllRawMaterials))

module.exports = router
