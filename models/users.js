const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const bcrypt = require('bcrypt')

const users = sequelize.define(
    'users',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        phone: { type: DataTypes.STRING },
        name: { type: DataTypes.STRING },
        surname: { type: DataTypes.STRING },
        permission: { type: DataTypes.STRING },
        status: { type: DataTypes.STRING },
        pass: { type: DataTypes.STRING, require: true },
        userClass: { type: DataTypes.STRING },
    },
    {
        hooks: {
            afterSync: async function (options) {
                // this = Model
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
