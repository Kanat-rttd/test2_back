const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const financeAccount = sequelize.define('financeAccount', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
})

module.exports = financeAccount
