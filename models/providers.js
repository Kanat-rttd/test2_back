const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const providers = sequelize.define('providers', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    providerName: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

module.exports = providers
