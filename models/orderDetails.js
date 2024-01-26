const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const order = require('./order')
const products = require('./products')

const orderDetails = sequelize.define('orderDetails', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER },
    productId: { type: DataTypes.INTEGER },
    orderedQuantity: { type: DataTypes.INTEGER },
    approvedQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
})

order.hasMany(orderDetails)
products.hasMany(orderDetails)

products.belongsTo(products)
orderDetails.belongsTo(order)

module.exports = orderDetails
