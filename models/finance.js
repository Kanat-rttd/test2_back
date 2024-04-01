const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')
const financeCategories = require('./financeCategories')

const finance = sequelize.define('finance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.STRING },
    date: { type: DataTypes.STRING },
    financeCategoryId: { type: DataTypes.INTEGER },
    clientId: { type: DataTypes.INTEGER },
    account: { type: DataTypes.STRING },
    comment: { type: DataTypes.STRING },
    invoiceNumber: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

clients.hasMany(finance)
financeCategories.hasMany(finance)

finance.belongsTo(clients)
finance.belongsTo(financeCategories)

module.exports = finance
