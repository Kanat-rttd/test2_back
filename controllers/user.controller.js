const models = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const tokenDecode = require('jwt-decode')

class UserController {
    async getAll(req, res, next) {
        const data = await models.users.findAll({
            attributes: ['id', 'name', 'userClass', 'phone'],
        })
        console.log(data)
        return res.json(data)
    }

    async createUser(req, res, next) {
        const { phone, name, userClass, pass } = req.body

        const hashedPass = await bcrypt.hash(pass, 10)

        await models.users.create({
            phone,
            name,
            userClass,
            pass: hashedPass,
        })
        return res.status(200).send('User Created')
    }

    async updateUser(req, res, next) {
        const { id } = req.params
        console.log(id)
        const { name, pass, userClass, phone } = req.body

        const updateObj = {
            name,
            userClass,
            phone,
        }

        if (pass !== undefined && pass !== null && pass !== '') {
            const hashedPass = await bcrypt.hash(pass, 10)
            updateObj.pass = hashedPass
        }

        await models.users.update(updateObj, {
            where: {
                id,
            },
        })
        return res.status(200).send('User updated')
    }

    async authenticateUser(req, res, next) {
        const { phone, pass } = req.body
        const user = await models.users.findOne({ where: { phone } })

        if (!user) {
            return res.status(401).send('Такого пользователя не существует')
        }

        const passCheck = await bcrypt.compare(pass, user.pass)

        if (!passCheck) {
            return res.status(401).send('Неверный логин или пароль')
        }

        const token = jwt.sign(
            { userId: user.id, phone: user.phone, class: user.userClass },
            '1C6981FDFC9D65A5B68BCA02313AE8C0191D2A9559BFA37C5D4D5FF620D76D96',
            { expiresIn: '1h' },
        )

        return res.status(200).json({ token, status: 'success' })
    }

    async check(req, res, next) {
        const authToken = req.header('Authorization')
        if (!authToken) {
            return res.status(401).json({ message: 'Токен отсутствует' })
        }

        const token = authToken.split(' ')[1]
        const tokenData = tokenDecode.jwtDecode(token)

        const user = await models.users.findByPk(tokenData.userId)

        if (!user) {
            return res.status(401).json({ message: 'Такого пользователя не существует' })
        }

        const currentTime = Math.floor(Date.now() / 1000)

        if (!(currentTime < tokenData.exp)) {
            return res.status(401).json({ message: 'Время сессий истекло' })
        }

        return res.json({ token })
    }
}

module.exports = new UserController()
