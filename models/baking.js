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
    // time: { type: DataTypes.TIME },
    output: { type: DataTypes.FLOAT },
    defective: { type: DataTypes.FLOAT },
    // date: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

product.hasMany(baking)

baking.belongsTo(product)

module.exports = baking
