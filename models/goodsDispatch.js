const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const goodsDispatchDetails = require('./goodsDispatchDetails')
const contragent = require('./contragent')

const goodsDispatch = sequelize.define('goodsDispatch', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    contragentId: { type: DataTypes.INTEGER, allowNull: false },
    dispatch: { type: DataTypes.INTEGER, defaultValue: 0 },
    invoiceNumber: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

const invoiceData = sequelize.define('invoiceData', {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, defaultValue: false },
    updatedAt: { type: DataTypes.DATE, defaultValue: false },
    contragentId: { type: DataTypes.INTEGER, defaultValue: false },
    dispatch: { type: DataTypes.INTEGER, defaultValue: false },
    invoiceNumber: { type: DataTypes.INTEGER, defaultValue: false },
})

contragent.hasMany(goodsDispatch)
goodsDispatch.belongsTo(contragent)

goodsDispatch.hasMany(goodsDispatchDetails)
goodsDispatchDetails.belongsTo(goodsDispatch)

invoiceData.hasOne(goodsDispatch, { foreignKey: 'id', as: 'invoiceData' })
goodsDispatch.belongsTo(invoiceData, { foreignKey: 'id', as: 'invoiceData' })

module.exports = { invoiceData, goodsDispatch }

// contragent.hasMany(invoiceData)
// invoiceData.belongsTo(contragent)

// invoiceData.hasMany(goodsDispatchDetails)
// goodsDispatchDetails.belongsTo(invoiceData)

// invoiceData.sync({ alter: true })
// module.exports = goodsDispatch
