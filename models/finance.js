const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const contragent = require('./contragent')
const financeCategories = require('./financeCategories')

const finance = sequelize.define('finance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.STRING },
    date: { type: DataTypes.STRING },
    financeCategoryId: { type: DataTypes.INTEGER },
    contragentId: { type: DataTypes.INTEGER },
    account: { type: DataTypes.STRING },
    comment: { type: DataTypes.STRING },
    invoiceNumber: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

contragent.hasMany(finance)
financeCategories.hasMany(finance)

finance.belongsTo(contragent)
finance.belongsTo(financeCategories)

module.exports = finance
