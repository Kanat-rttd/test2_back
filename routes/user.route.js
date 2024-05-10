const { Router } = require('express')
const Controller = require('../controllers/user.controller')
const catchAsync = require('../filters/catchAsync')
let router = Router()

router.get('/', catchAsync(Controller.getAll))
router.post('/', catchAsync(Controller.createUser))
router.put('/:id', catchAsync(Controller.updateUser))
router.post('/login', catchAsync(Controller.authenticateUser))
router.get('/auth', catchAsync(Controller.check))
router.delete('/:id', catchAsync(Controller.deleteUser))

module.exports = router
