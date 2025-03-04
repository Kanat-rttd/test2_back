const tokenDecode = require('jwt-decode')

const roleCheck = (requiredRole) => {
    return (req, res, next) => {
        const authToken = req.header('Authorization')
        const token = authToken.split(' ')[1]
        const tokenData = tokenDecode.jwtDecode(token)

        const parsedData = JSON.parse(tokenData.class)
        const hasRole = parsedData.some((obj) => obj.label === requiredRole)

        if (!hasRole) {
            return res.status(403).json({ message: 'Недостаточно прав доступа', role: parsedData })
        }

        next()
    }
}

module.exports = roleCheck
