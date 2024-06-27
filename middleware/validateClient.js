const { clients, users } = require('../models')

const validateClient = async (req, res, next) => {
    const { contact, name } = req.body

    try {
        const existingClientPhone = await clients.findOne({
            where: {
                contact,
                isDeleted: false,
            },
        })

        const existingClientName = await clients.findOne({
            where: {
                name,
                isDeleted: false,
            },
        })

        const existingUserPhone = await users.findOne({
            where: {
                phone: contact,
                isDeleted: false,
            },
        })

        const existingUserName = await users.findOne({
            where: {
                name,
                isDeleted: false,
            },
        })

        if (existingClientPhone || existingUserPhone) {
            return res.status(400).json({ message: 'Пользователь с таким телефоном уже существует' })
        }

        if (existingClientName || existingUserName) {
            return res.status(400).json({ message: 'Пользователь с таким именем уже существует' })
        }

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = validateClient
