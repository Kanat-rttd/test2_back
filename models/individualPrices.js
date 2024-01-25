const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')
const products = require('./products')

const individualPrices = sequelize.define('individualPrices', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER },
    clientId: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

clients.hasMany(individualPrices)
products.hasMany(individualPrices)

individualPrices.belongsTo(clients)
individualPrices.belongsTo(products)

module.exports = individualPrices
