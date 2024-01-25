const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')

const order = sequelize.define(
    'order',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        clientId: { type: DataTypes.INTEGER },
        statusId: { type: DataTypes.INTEGER, defaultValue: 0 },
        totalPrice: { type: DataTypes.INTEGER },
        editableUntil: { type: DataTypes.DATE },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
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

clients.hasMany(order)
order.belongsTo(clients)

module.exports = order
