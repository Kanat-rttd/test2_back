const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')
const products = require('./products')

const requests = sequelize.define('requests', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: DataTypes.INTEGER },
    done: { type: DataTypes.BOOLEAN, defaultValue: false },
})

clients.hasMany(requests)
products.hasMany(requests)

requests.belongsTo(clients)
requests.belongsTo(products)

module.exports = requests
