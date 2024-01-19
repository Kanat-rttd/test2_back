const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const users = sequelize.define('users', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    phone: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING },
    pass: { type: DataTypes.STRING, require: true },
    userClass: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
})

module.exports = users
