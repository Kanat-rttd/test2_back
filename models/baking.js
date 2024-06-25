const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const product = require('./products')

const baking = sequelize.define('baking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: { type: DataTypes.INTEGER },
    temperature: { type: DataTypes.FLOAT },
    dateTime: { type: DataTypes.DATE },
    output: { type: DataTypes.FLOAT },
    defective: { type: DataTypes.FLOAT },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

const bakingDetails = sequelize.define('bakingDetails', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bakingId: { type: DataTypes.INTEGER },
    goodsCategoryId: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.FLOAT },
})

product.hasMany(baking)
baking.belongsTo(product)

baking.hasMany(bakingDetails)
bakingDetails.belongsTo(baking)

module.exports = { baking, bakingDetails }

// const baking = sequelize.define('baking', {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     flour: { type: DataTypes.FLOAT },
//     salt: { type: DataTypes.FLOAT },
//     yeast: { type: DataTypes.FLOAT },
//     malt: { type: DataTypes.FLOAT },
//     butter: { type: DataTypes.FLOAT },
//     temperature: { type: DataTypes.FLOAT },
//     dateTime: { type: DataTypes.DATE },
//     output: { type: DataTypes.FLOAT },
//     defective: { type: DataTypes.FLOAT },
//     isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
// })
