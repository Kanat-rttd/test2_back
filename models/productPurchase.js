const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
// const rawMaterials = require('./rawMaterials')
const providerGoods = require('./providerGoods')
const providers = require('./providers')
const goodsCategories = require('./goodsCategories')

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
    goodsCategoryId: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER },
    price: { type: DataTypes.INTEGER },
    deliverySum: { type: DataTypes.INTEGER },
    totalSum: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

// rawMaterials.hasMany(productPurchase, {foreignKey:'rawMaterialId'})
// productPurchase.belongsTo(rawMaterials, {foreignKey:'rawMaterialId'})
goodsCategories.hasMany(productPurchase)
productPurchase.belongsTo(goodsCategories)

productPurchase.belongsTo(goodsCategories, { as: 'pp', foreignKey: 'goodsCategoryId' })
goodsCategories.hasMany(productPurchase, { as: 'pp', foreignKey: 'goodsCategoryId' })

productPurchase.belongsTo(goodsCategories, { as: 'pp_expenses', foreignKey: 'goodsCategoryId' })
goodsCategories.hasMany(productPurchase, { as: 'pp_expenses', foreignKey: 'goodsCategoryId' })

providerGoods.hasMany(productPurchase)
productPurchase.belongsTo(providerGoods)

providers.hasMany(productPurchase)
productPurchase.belongsTo(providers)

module.exports = productPurchase
