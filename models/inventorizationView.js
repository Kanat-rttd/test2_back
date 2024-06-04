const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const inventorizations = sequelize.define('inventorizations', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    goods: { type: DataTypes.STRING },
    unitOfMeasure: { type: DataTypes.STRING },
    accountingQuantity: { type: DataTypes.INTEGER },
    factQuantity: { type: DataTypes.INTEGER },
    adjustments: { type: DataTypes.INTEGER },
    discrepancy: { type: DataTypes.INTEGER },
})

module.exports = { inventorizations }
