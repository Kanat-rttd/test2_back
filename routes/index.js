const { Router } = require('express')
const userRouter = require('./user.route')
const requestRouter = require('./request.route')
const clientRouter = require('./client.route')
const productRouter = require('./product.route')
const bakingRouter = require('./baking.route')
const catchAsync = require('../filters/catchAsync')
let router = Router()

router.use('/user', catchAsync(userRouter))
router.use('/requests', catchAsync(requestRouter))
router.use('/client', catchAsync(clientRouter))
router.use('/product', catchAsync(productRouter))
router.use('/baking', catchAsync(bakingRouter))

module.exports = router
