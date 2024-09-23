const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const contragent = require('./contragent')
const financeCategories = require('./financeCategories')
const financeAccount = require('./financeAccount')

const finance = sequelize.define('finance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.INTEGER },
    date: { type: DataTypes.DATE },
    financeCategoryId: { type: DataTypes.INTEGER },
    contragentId: { type: DataTypes.INTEGER },
    comment: { type: DataTypes.STRING },
    invoiceNumber: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

contragent.hasMany(finance)
financeCategories.hasMany(finance)
financeAccount.hasMany(finance)

finance.belongsTo(contragent)
finance.belongsTo(financeCategories)
finance.belongsTo(financeAccount)

module.exports = finance
