const tokenDecode = require('jwt-decode')

const roleCheck = (requiredRole) => {
    return (req, res, next) => {
        const authToken = req.header('Authorization')
        const token = authToken.split(' ')[1]
        const tokenData = tokenDecode.jwtDecode(token)

        const hasPermission = tokenData.class === requiredRole

        if (!hasPermission) {
            return res.status(403).json({ message: 'Недостаточно прав доступа' })
        }

        next()
    }
}

module.exports = roleCheck
