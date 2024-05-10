const models = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const tokenDecode = require('jwt-decode')

class UserController {
    async getAll(req, res, next) {
        const { status } = req.query
        console.log('query Recieved', status)
        let filterOptions = {}
        if (status) {
            filterOptions.status = status
        }

        const data = await models.users.findAll({
            attributes: ['id', 'name', 'userClass', 'phone', 'surname', 'status', 'fixSalary'],
            where: filterOptions,
        })

        return res.json(data)
    }

    async createUser(req, res, next) {
        const userData = req.body

        const hashedPass = await bcrypt.hash(userData.pass, 10)

        await models.users.create({
            name: userData.name,
            userClass: userData.userClass,
            surname: userData.surname,
            phone: userData.phone,
            pass: hashedPass,
            status: userData.status,
            fixSalary: userData.fixSalary,
        })

        return res.status(200).send('User Created')
    }

    async updateUser(req, res, next) {
        const { id } = req.params
        // console.log(id)
        const { name, userClass, surname, phone, pass, status, fixSalary } = req.body

        const updateObj = {
            name,
            userClass,
            phone,
            surname,
            status,
            fixSalary,
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

    async deleteUser(req, res) {
        const { id } = req.params

        const deletedUser = await models.users.destroy({
            where: {
                id,
            },
        })
        return res.json({ message: 'Пользователь успешно удален', data: deletedUser })
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
