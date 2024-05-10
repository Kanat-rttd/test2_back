import { ValidationError, UniqueConstraintError } from 'sequelize'
import ApiError from './ApiError.js'

function errorHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.log(err)
            console.log(err.message)
            if (err instanceof UniqueConstraintError) {
                let customMessage = 'Ошибка уникальности данных'
                console.log(err)
                res.status(400).json({ message: customMessage })
            } else if (err instanceof ValidationError) {
                const errors = Object.values(err.errors).map((e) => e.message)
                res.status(400).json({ message: errors[0] })
            } else {
                next(ApiError.badRequest(err.message))
                res.status(400).send({ message: err.message })
            }
        })
    }
}
module.exports = errorHandler
