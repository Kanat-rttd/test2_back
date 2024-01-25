const { ValidationError } = require('sequelize')
const ApiError = require('../helpers/ApiError')

function catchAsync(controllerFunction) {
    return async (req, res, next) => {
        try {
            await controllerFunction(req, res, next)
        } catch (err) {
            if (err instanceof ValidationError) {
                const errors = Object.values(err.errors).map((e) => e.message)
                res.status(400).json({ message: errors[0] })
            } else {
                next(ApiError.badRequest(err.message))
                res.status(400).send('Application error contact support')
            }
        }
    }
}

module.exports = catchAsync
