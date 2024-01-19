const { Router } = require('express')
const Controller = require('../controllers/baking.controller')

let router = Router()

router.get('/', Controller.getAll)

module.exports = router
