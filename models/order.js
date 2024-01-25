const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')

const order = sequelize.define('order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientId: { type: DataTypes.INTEGER },
    statusId: { type: DataTypes.INTEGER },
    totalPrice: { type: DataTypes.INTEGER },
})

clients.hasMany(order)
order.belongsTo(clients)

module.exports = order
