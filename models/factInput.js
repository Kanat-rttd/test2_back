const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const factInput = sequelize.define('factInput', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    place: { type: DataTypes.STRING },
    unitOfMeasure: { type: DataTypes.STRING },
    quantity: { type: DataTypes.STRING },
})

module.exports = factInput
