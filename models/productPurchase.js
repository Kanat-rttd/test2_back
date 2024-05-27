const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
// const rawMaterials = require('./rawMaterials')
const providerGoods = require('./providerGoods')
const providers = require('./providers')

// const productPurchase = sequelize.define('productPurchase', {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     date: { type: DataTypes.DATE },
//     providerId: { type: DataTypes.INTEGER },
//     rawMaterialId: { type: DataTypes.INTEGER },
//     quantity: { type: DataTypes.INTEGER },
//     price: { type: DataTypes.INTEGER },
//     deliverySum: { type: DataTypes.INTEGER },
//     totalSum: { type: DataTypes.INTEGER },
//     status: { type: DataTypes.STRING },
//     isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
// })

const productPurchase = sequelize.define('productPurchase', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATE },
    providerId: { type: DataTypes.INTEGER },
    providerGoodId: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER },
    price: { type: DataTypes.INTEGER },
    deliverySum: { type: DataTypes.INTEGER },
    totalSum: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

// rawMaterials.hasMany(productPurchase, {foreignKey:'rawMaterialId'})
// productPurchase.belongsTo(rawMaterials, {foreignKey:'rawMaterialId'})
providerGoods.hasMany(productPurchase)
productPurchase.belongsTo(providerGoods)

providers.hasMany(productPurchase)
productPurchase.belongsTo(providers)

module.exports = productPurchase
