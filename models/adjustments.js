const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const providerGoods = require('./providerGoods')

const adjustments = sequelize.define('adjustments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    providerGoodId: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.STRING },
    comment: { type: DataTypes.STRING },
})

providerGoods.hasMany(adjustments)
adjustments.belongsTo(providerGoods)

module.exports = adjustments
