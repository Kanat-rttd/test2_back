const { Router } = require('express')
const userRouter = require('./user.route')
const requestRouter = require('./request.route')
const clientRouter = require('./client.route')
const productRouter = require('./product.route')
const bakingRouter = require('./baking.route')
const salesRouter = require('./sales.route')
let router = Router()

router.use('/user', userRouter)
router.use('/requests', requestRouter)
router.use('/client', clientRouter)
router.use('/product', productRouter)
router.use('/baking', bakingRouter)
router.use('/sales', salesRouter)

module.exports = router
