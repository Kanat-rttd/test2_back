const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const providerGoods = require('./providerGoods')
const goodsCategories = require('./goodsCategories')

const factInput = sequelize.define('factInput', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    goodsCategoryId: { type: DataTypes.INTEGER },
    place: { type: DataTypes.STRING },
    quantity: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

goodsCategories.hasMany(factInput)
factInput.belongsTo(goodsCategories)

module.exports = factInput
