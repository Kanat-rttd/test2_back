const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const clients = sequelize.define('clients', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    surname: { type: DataTypes.STRING },
    contact: { type: DataTypes.STRING },
    telegrammId: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    status: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

module.exports = clients
