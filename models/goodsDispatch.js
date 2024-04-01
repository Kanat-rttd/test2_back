const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')
const goodsDispatchDetails = require('./goodsDispatchDetails')

const goodsDispatch = sequelize.define('goodsDispatch', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientId: { type: DataTypes.INTEGER },
    dispatch: { type: DataTypes.INTEGER, defaultValue: 0 },
    invoiceNumber: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

const invoiceData = sequelize.define('invoiceData', {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, defaultValue: false },
    updatedAt: { type: DataTypes.DATE, defaultValue: false },
    clientId: { type: DataTypes.INTEGER, defaultValue: false },
    dispatch: { type: DataTypes.INTEGER, defaultValue: false },
    invoiceNumber: { type: DataTypes.INTEGER, defaultValue: false },
})

clients.hasMany(goodsDispatch)
goodsDispatch.hasMany(goodsDispatchDetails)

goodsDispatchDetails.belongsTo(goodsDispatch)
goodsDispatch.belongsTo(clients)

invoiceData.hasOne(goodsDispatch, { foreignKey: 'id', as: 'invoiceData' })
goodsDispatch.belongsTo(invoiceData, { foreignKey: 'id', as: 'invoiceData' })

// clients.hasMany(invoiceData)
// invoiceData.hasMany(goodsDispatchDetails)

// goodsDispatchDetails.belongsTo(invoiceData)
// invoiceData.belongsTo(clients)

// invoiceData.sync({ alter: true })
module.exports = { invoiceData, goodsDispatch }
// module.exports = goodsDispatch
