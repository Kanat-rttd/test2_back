const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')

const magazines = sequelize.define('magazines', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    clientId: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING },
    isDeleted : {type: DataTypes.BOOLEAN , defaultValue: false}
})

clients.hasMany(magazines)
magazines.belongsTo(clients)

module.exports = magazines
