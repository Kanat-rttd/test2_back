const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const factInput = sequelize.define('factInput', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    place: { type: DataTypes.STRING },
    unitOfMeasure: { type: DataTypes.STRING },
    quantity: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

module.exports = factInput
