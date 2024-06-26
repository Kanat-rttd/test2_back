const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const contragentType = require('./contragentType')

const financeCategories = sequelize.define('financeCategories', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
    contragentTypeId: { type: DataTypes.INTEGER },
})

contragentType.hasMany(financeCategories)
financeCategories.belongsTo(contragentType)

module.exports = financeCategories
