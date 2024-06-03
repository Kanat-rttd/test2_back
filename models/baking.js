const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const product = require('./products')

const baking = sequelize.define('baking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    flour: { type: DataTypes.FLOAT },
    salt: { type: DataTypes.FLOAT },
    yeast: { type: DataTypes.FLOAT },
    malt: { type: DataTypes.FLOAT },
    butter: { type: DataTypes.FLOAT },
    temperature: { type: DataTypes.FLOAT },
    dateTime: { type: DataTypes.DATE },
    output: { type: DataTypes.FLOAT },
    defective: { type: DataTypes.FLOAT },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

product.hasMany(baking)

baking.belongsTo(product)

module.exports = baking
