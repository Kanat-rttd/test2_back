const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const products = require('./products')

const bakingFacilityUnits = sequelize.define('bakingFacilityUnits', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    facilityUnit: { type: DataTypes.STRING },
})

bakingFacilityUnits.hasMany(products)

products.belongsTo(bakingFacilityUnits)

module.exports = bakingFacilityUnits
