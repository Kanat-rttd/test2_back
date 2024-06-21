const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const goodsCategories = require('./goodsCategories')

const adjustments = sequelize.define('adjustments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    goodsCategoryId: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.STRING },
    comment: { type: DataTypes.STRING },
})

goodsCategories.hasMany(adjustments)
adjustments.belongsTo(goodsCategories)

module.exports = adjustments
