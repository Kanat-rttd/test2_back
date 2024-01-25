const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const order = require('./order')

const orderDetails = sequelize.define('orderDetails', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER },
    productId: { type: DataTypes.INTEGER },
    orderedQuantity: { type: DataTypes.INTEGER },
    approvedQuantity: { type: DataTypes.INTEGER },
    totalPrice: { type: DataTypes.INTEGER },
})

order.hasMany(orderDetails)

orderDetails.belongsTo(order)

module.exports = orderDetails
