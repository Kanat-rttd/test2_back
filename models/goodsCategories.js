const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const goodsCategories = sequelize.define('goodsCategories', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
})

module.exports = goodsCategories
