const { ValidationError } = require('sequelize')
const AppError = require('../filters/appError')

function catchAsync(controllerFunction) {
    return async (req, res, next) => {
        try {
            await controllerFunction(req, res, next)
        } catch (err) {
            if (err instanceof ValidationError) {
                const errors = Object.values(err.errors).map((e) => e.message)
                next(new AppError(errors[0], 400))
            } else {
                next(new AppError(err.message, 405))
            }
        }
    }
}

module.exports = catchAsync
