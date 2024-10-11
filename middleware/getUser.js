const tokenDecode = require('jwt-decode')

module.exports = (req, res, next) => {
    const authToken = req.headers['authorization']
    const token = authToken.split(' ')[1]
    req.user = tokenDecode.jwtDecode(token)

    next()
}
