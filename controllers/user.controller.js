const { Op } = require('sequelize')
const models = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const tokenDecode = require('jwt-decode')

class UserController {
    async getAll(req, res) {
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

    async createUser(req, res) {
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

    async updateUser(req, res) {
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
            updateObj.pass = await bcrypt.hash(userData.pass, 10)
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

    async authenticateUser(req, res) {
        try {
            const { phone, pass } = req.body

            if (!phone || !pass) {
                return res.status(400).send('Телефон и пароль обязательны для ввода')
            }

            const [user, client] = await Promise.all([
                models.users.findOne({ where: { phone } }),
                models.clients.findOne({ where: { contact: phone } }),
            ])

            if (!user && !client) {
                return res.status(401).send('Пользователь или клиент не найден')
            }

            if ((user && !user.status) || (client && !client.status)) {
                return res.status(401).send('Пользователь не активен')
            }

            let passCheck = false
            let tokenPayload = {}

            if (user) {
                passCheck = await bcrypt.compare(pass, user.pass)
                if (passCheck) {
                    tokenPayload = { userId: user.id, phone: user.phone, class: user.permission }
                }
            }

            if (client && !passCheck) {
                passCheck = await bcrypt.compare(pass, client.password)
                if (passCheck) {
                    tokenPayload = { clientId: client.id, phone: client.contact, class: '[{ "label": "Реализатор" }]' }
                }
            }

            if (!passCheck) {
                return res.status(401).send('Неверный логин или пароль')
            }

            const token = jwt.sign(tokenPayload, '1C6981FDFC9D65A5B68BCA02313AE8C0191D2A9559BFA37C5D4D5FF620D76D96', {
                expiresIn: '12h',
            })

            return res.status(200).json({ token, status: 'success' })
        } catch (error) {
            console.error(error)
            return res.status(500).send('Произошла ошибка на сервере')
        }
    }

    async check(req, res) {
        const currentTime = Math.floor(Date.now() / 1000)

        const authToken = req.header('Authorization')

        if (!authToken) {
            return res.status(401).json({ message: 'Токен отсутствует' })
        }

        const token = authToken.split(' ')[1]
        const tokenData = tokenDecode.jwtDecode(token)

        const user = await models.users.findByPk(tokenData.userId)
        const client = await models.clients.findByPk(tokenData.clientId)

        if (!(currentTime < tokenData.exp)) {
            return res.status(401).json({ message: 'Время сессий истекло' })
        } else {
            if (user || client) {
                return res.json({ token })
            }

            return res.status(401).json({ message: 'Такого пользователя не существует' })
        }
    }
}

module.exports = new UserController()
