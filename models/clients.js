const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const clients = sequelize.define(
    'clients',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING },
        surname: { type: DataTypes.STRING },
        contact: { type: DataTypes.STRING },
        telegrammId: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING },
        status: { type: DataTypes.STRING },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['contact'],
                name: 'phone_unique_constraint',
                msg: 'Пользователь с таким телефоном уже существует',
            },
            {
                unique: true,
                fields: ['clientName'],
                name: 'client_name_unique_constraint',
                msg: 'Пользователь с таким именем уже существует',
            },
        ],
    },
)

module.exports = clients
