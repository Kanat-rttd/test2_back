const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const models = require('../models')

const clients = sequelize.define(
    'clients',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING },
        surname: { type: DataTypes.STRING },
        contact: { type: DataTypes.STRING },
        telegrammId: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING },
        status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        hooks: {
            beforeCreate: async (client) => {
                const { contact, name } = client

                console.log(contact, name)

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

                if (existingClientPhone) {
                    throw new Error('Пользователь с таким телефоном уже существует')
                }

                if (existingClientName) {
                    throw new Error('Пользователь с таким именем уже существует')
                }
            },
            beforeUpdate: async (client) => {
                const { contact, name } = client

                const currentClient = await clients.findByPk(client.id)

                if (contact !== currentClient.contact) {
                    const existingClientPhone = await clients.findOne({
                        where: {
                            contact,
                            isDeleted: false,
                        },
                    })
                    if (existingClientPhone) {
                        throw new Error('Пользователь с таким телефоном уже существует')
                    }
                }

                if (name !== currentClient.name) {
                    const existingClientName = await clients.findOne({
                        where: {
                            name,
                            isDeleted: false,
                        },
                    })

                    if (existingClientName) {
                        throw new Error('Пользователь с таким именем уже существует')
                    }
                }
            },
        },
    },
)

module.exports = clients
