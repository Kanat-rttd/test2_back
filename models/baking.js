const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const product = require('./products')

const baking = sequelize.define('baking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    flour: { type: DataTypes.INTEGER },
    salt: { type: DataTypes.INTEGER },
    yeast: { type: DataTypes.INTEGER },
    malt: { type: DataTypes.INTEGER },
    butter: { type: DataTypes.INTEGER },
    temperature: { type: DataTypes.INTEGER },
    time: { type: DataTypes.TIME },
    output: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

product.hasMany(baking)

baking.belongsTo(product)

module.exports = baking
