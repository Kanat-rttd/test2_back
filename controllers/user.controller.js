const { Op } = require('sequelize')
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
            attributes: [
                'id',
                'name',
                'userClass',
                'phone',
                'surname',
                'status',
                'fixSalary',
                'permission',
                'isDeleted',
            ],

            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
        })

        return res.json(data)
    }

    async createUser(req, res, next) {
        const userData = req.body

        const permissions = userData.permission.map((perms) => ({ label: perms.label }))

        const permissionString = JSON.stringify(permissions)

        const hashedPass = await bcrypt.hash(userData.pass, 10)

        const data = {
            phone: userData.phone,
            name: userData.name,
            pass: hashedPass,
            userClass: userData.userClass,
            surname: userData.surname,
            permission: permissionString,
            status: userData.status,
            fixSalary: userData.fixSalary,
        }

        console.log(data)

        await models.users.create(data)

        return res.status(200).send('User Created')
    }

    async updateUser(req, res, next) {
        const { id } = req.params
        const userData = req.body

        const permissions = userData.permission.map((perms) => ({ label: perms.label }))

        const permissionString = JSON.stringify(permissions)

        const updateObj = {
            phone: userData.phone,
            name: userData.name,
            userClass: userData.userClass,
            surname: userData.surname,
            permission: permissionString,
            status: userData.status,
            fixSalary: userData.fixSalary,
        }

        if (userData.pass !== undefined && userData.pass !== null && userData.pass !== '') {
            const hashedPass = await bcrypt.hash(userData.pass, 10)
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

        const deletedUser = await models.users.update(
            {
                isDeleted: true,
            },
            {
                where: {
                    id,
                },
            },
        )
        return res.status(200).json({ message: 'Пользователь успешно удален', data: deletedUser })
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
            { userId: user.id, phone: user.phone, class: user.permission },
            '1C6981FDFC9D65A5B68BCA02313AE8C0191D2A9559BFA37C5D4D5FF620D76D96',
            { expiresIn: '12h' },
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
