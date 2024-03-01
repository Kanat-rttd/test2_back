const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')
const goodsDispatchDetails = require('./goodsDispatchDetails')

const goodsDispatch = sequelize.define('goodsDispatch', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientId: { type: DataTypes.INTEGER },
    dispatch: { type: DataTypes.INTEGER, defaultValue: 0 },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

clients.hasMany(goodsDispatch)
goodsDispatch.hasMany(goodsDispatchDetails)

goodsDispatchDetails.belongsTo(goodsDispatch)
goodsDispatch.belongsTo(clients)

module.exports = goodsDispatch
