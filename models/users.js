const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')

const users = sequelize.define(
    'users',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        phone: { type: DataTypes.STRING },
        name: { type: DataTypes.STRING },
        surname: { type: DataTypes.STRING },
        permission: { type: DataTypes.STRING },
        status: { type: DataTypes.STRING },
        fixSalary: { type: DataTypes.STRING },
        pass: { type: DataTypes.STRING, require: true },
        userClass: { type: DataTypes.STRING },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        hooks: {
            beforeCreate: async (user) => {
                const { phone, name } = user

                const existingUserPhone = await users.findOne({
                    where: {
                        phone,
                        isDeleted: false,
                    },
                })
                const existingUserName = await users.findOne({
                    where: {
                        name,
                        isDeleted: false,
                    },
                })

                if (existingUserPhone) {
                    throw new Error('Пользователь с таким телефоном уже существует')
                }

                if (existingUserName) {
                    throw new Error('Пользователь с таким именем уже существует')
                }
            },
            beforeUpdate: async (user) => {
                const { phone, name } = user

                const currentUser = await users.findByPk(user.id)

                if (phone !== currentUser.phone) {
                    const existingUserPhone = await users.findOne({
                        where: {
                            phone,
                            isDeleted: false,
                        },
                    })
                    if (existingUserPhone) {
                        throw new Error('Пользователь с таким телефоном уже существует')
                    }
                }

                if (name !== currentUser.name) {
                    const existingUserName = await users.findOne({
                        where: {
                            name,
                            isDeleted: false,
                        },
                    })

                    if (existingUserName) {
                        throw new Error('Пользователь с таким именем уже существует')
                    }
                }
            },
            afterSync: async function (options) {
                console.log('afterSync')
                try {
                    const defaultPhone = '0000000000'
                    const defaultPass = 'admin'

                    const existingUser = await users.findOne({ where: { phone: defaultPhone } })

                    if (!existingUser) {
                        const hashedPass = await bcrypt.hash(defaultPass, 10)
                        await users.create({
                            phone: defaultPhone,
                            name: 'Default User',
                            userClass: 'Admin',
                            pass: hashedPass,
                            permission: `[{"label":"Admin"}]`,
                        })
                        console.log('Default user created successfully.')
                    }
                } catch (error) {
                    console.error('Failed to ensure default user exists:', error)
                }
            },
        },
    },
)

module.exports = users
