const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const providerGoods = require('./providerGoods')

const inventorizations = sequelize.define('inventorizations', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    providerGoodId: { type: DataTypes.INTEGER },
    unitOfMeasure: { type: DataTypes.STRING },
    accountingQuantity: { type: DataTypes.INTEGER },
    factQuantity: { type: DataTypes.INTEGER },
    adjustments: { type: DataTypes.INTEGER },
    discrepancy: { type: DataTypes.INTEGER },
})

providerGoods.hasMany(inventorizations)
inventorizations.belongsTo(providerGoods)

module.exports = { inventorizations }
