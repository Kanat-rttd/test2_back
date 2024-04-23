const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const client = require('./clients')

const overPrices = sequelize.define('overPrices', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    price: { type: DataTypes.INTEGER },
    clientId: { type: DataTypes.INTEGER },
    month: { type: DataTypes.INTEGER },
    year: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

client.hasMany(overPrices)

overPrices.belongsTo(client)

module.exports = overPrices
