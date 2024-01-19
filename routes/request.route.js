const { Router } = require('express')
const Controller = require('../controllers/request.controller')

let router = Router()

router.get('/', Controller.getAll)
router.post('/', Controller.createRequest)

module.exports = router
