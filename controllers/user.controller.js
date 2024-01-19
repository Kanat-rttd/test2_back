const models = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

class UserController {
    async getAll(req, res, next) {
        const data = await models.users.findAll({
            attributes: ['id', 'name', 'userClass', 'phone'],
        })
        console.log(data)
        return res.json(data)
    }

    async createUser(req, res, next) {
        const { name, userClass, pass } = req.body

        const hashedPass = await bcrypt.hash(pass, 10)

        await models.users.create({
            name,
            userClass,
            pass: hashedPass,
        })
        //TODO: возвращать данные о созданном пользователи
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
            return res.status(401).send('Invalid credentials')
        }

        const passCheck = await bcrypt.compare(pass, user.pass)

        if (!passCheck) {
            return res.status(401).send('Invalid credentials')
        }

        const token = jwt.sign(
            { userId: user.id, phone: user.phone },
            '1C6981FDFC9D65A5B68BCA02313AE8C0191D2A9559BFA37C5D4D5FF620D76D96',
            { expiresIn: '1h' },
        )

        return res.status(200).json({ token })
    }
}

module.exports = new UserController()
