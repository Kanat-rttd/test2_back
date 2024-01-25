const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    console.log(err)
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    })
}

module.exports = errorHandler
