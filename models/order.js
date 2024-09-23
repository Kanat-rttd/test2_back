const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const users = require('./users')
const orderDetails = require('./orderDetails')
const clients = require('./clients')

const order = sequelize.define(
    'order',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: DataTypes.DATE },
        userId: { type: DataTypes.INTEGER },
        clientId: { type: DataTypes.INTEGER },
        statusId: { type: DataTypes.INTEGER, defaultValue: 0 },
        totalQuantity: { type: DataTypes.INTEGER },
        editableUntil: { type: DataTypes.DATE },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
        done: { type: DataTypes.INTEGER, defaultValue: 0 },
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

users.hasMany(order)
clients.hasMany(order)
order.hasMany(orderDetails)

orderDetails.belongsTo(order)
order.belongsTo(users)
order.belongsTo(clients)

module.exports = order
