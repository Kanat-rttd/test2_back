const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const users = require('./users')
const goodsDispatchDetails = require('./goodsDispatchDetails')

const goodsDispatch = sequelize.define('goodsDispatch', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

users.hasMany(goodsDispatch)
goodsDispatch.hasMany(goodsDispatchDetails)

goodsDispatchDetails.belongsTo(goodsDispatch)
goodsDispatch.belongsTo(users)

module.exports = goodsDispatch
