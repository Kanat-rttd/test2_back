const { Router } = require('express')
const Controller = require('../controllers/user.controller')

let router = Router()

router.get('/', Controller.getAll)
router.post('/', Controller.createUser)
router.put('/:id', Controller.updateUser)
router.post('/login', Controller.authenticateUser)

module.exports = router
