const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const order = require('./order')
const products = require('./products')

const orderDetails = sequelize.define(
    'orderDetails',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        orderId: { type: DataTypes.INTEGER },
        productId: { type: DataTypes.INTEGER },
        orderedQuantity: { type: DataTypes.INTEGER },
        approvedQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
        editableUntil: { type: DataTypes.DATE },
    },
    {
        hooks: {
            beforeCreate: (order, options) => {
                const currentHour = new Date().getHours()

                if (currentHour >= 0 && currentHour < 11) {
                    const currentMinutes = new Date().getMinutes()
                    if (currentHour === 11 && currentMinutes > 0) {
                        order.editableUntil = new Date().setHours(11, 0, 0, 0)
                    } else {
                        order.editableUntil = new Date().setHours(11, 0, 0, 0)
                    }
                } else {
                    const nextDay = new Date()
                    nextDay.setDate(nextDay.getDate() + 1)
                    nextDay.setHours(11, 0, 0, 0)
                    order.editableUntil = nextDay
                }
            },
        },
    },
)

products.hasMany(orderDetails)
orderDetails.belongsTo(products)

module.exports = orderDetails
