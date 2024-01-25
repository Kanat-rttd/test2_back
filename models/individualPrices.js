const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const users = require('./users')
const products = require('./products')

const individualPrices = sequelize.define('individualPrices', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER },
    clientId: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

users.hasMany(individualPrices)
products.hasMany(individualPrices)

individualPrices.belongsTo(users)
individualPrices.belongsTo(products)

module.exports = individualPrices
