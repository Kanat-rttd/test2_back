const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const clients = sequelize.define('clients', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

module.exports = clients
