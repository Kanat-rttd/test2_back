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

adjustments.belongsTo(goodsCategories, { as: 'ad', foreignKey: 'goodsCategoryId' })
goodsCategories.hasMany(adjustments, { as: 'ad', foreignKey: 'goodsCategoryId' })
adjustments.belongsTo(goodsCategories, { as: 'period_ad', foreignKey: 'goodsCategoryId' })
goodsCategories.hasMany(adjustments, { as: 'period_ad', foreignKey: 'goodsCategoryId' })

module.exports = adjustments
