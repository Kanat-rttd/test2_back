const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const client = require('./clients')
const products = require('./products')

const individualPrices = sequelize.define('individualPrices', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    price: { type: DataTypes.INTEGER },
    clientId: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

client.hasMany(individualPrices)
products.hasMany(individualPrices)

individualPrices.belongsTo(client)
individualPrices.belongsTo(products)

module.exports = individualPrices
