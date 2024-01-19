const { Router } = require('express')
const Controller = require('../controllers/client.controller')
const { route } = require('./user.route')

let router = Router()

router.get('/', Controller.getAll)
router.post('/', Controller.createClient)
router.put('/:id', Controller.updateClient)
router.delete('/:id', Controller.deleteClient)

module.exports = router
