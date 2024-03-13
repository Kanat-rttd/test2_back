const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const providers = sequelize.define('providers', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
})

module.exports = providers
