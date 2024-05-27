const { ValidationError } = require('sequelize')
const AppError = require('../filters/appError')

function catchAsync(controllerFunction) {
    return async (req, res, next) => {
        try {
            await controllerFunction(req, res, next)
        } catch (err) {
            console.log(err, 'oshibka')
            if (err instanceof ValidationError) {
                const errors = Object.values(err.errors).map((e) => e.message)

                console.log('Error: Valid ', err)
                console.log('Error check: ', err.errors[0].path)

                const validationErrors = {
                    phone_unique_constraint: 'Пользователь с таким номером уже зарегистрирован',
                    name_unique_constraint: 'Пользователь с таким именем уже зарегистрирован',
                    client_name_unique_constraint: 'Реализатор с таким именем уже зарегистрирован',
                    goods: 'Такой товар уже существует',
                }

                return res.status(400).json({
                    message: validationErrors[err.errors[0].path],
                    error: errors[0],
                    field: err.errors[0].path.replace('_unique_constraint', ''),
                })
                // next(new AppError(errors[0], 400))
            } else {
                return res.status(405).json({ error: err.message })
                // next(new AppError(err.message, 405))
            }
        }
    }
}

module.exports = catchAsync
