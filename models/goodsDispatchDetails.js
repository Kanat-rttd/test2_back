const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const products = require('./products')
const goodsDispatch = require('./goodsDispatch')

const goodsDispatchDetails = sequelize.define('goodsDispatchDetails', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    goodsDispatchId: { type: DataTypes.INTEGER },
    productId: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER },
    price: { type: DataTypes.STRING },
})

products.hasMany(goodsDispatchDetails)
goodsDispatchDetails.belongsTo(products)

module.exports = goodsDispatchDetails
