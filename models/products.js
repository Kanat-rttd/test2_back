const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const products = sequelize.define('products', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    price: { type: DataTypes.INTEGER },
    costPrice: { type: DataTypes.INTEGER },
    status: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

module.exports = products
