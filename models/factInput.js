const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const providerGoods = require('./providerGoods')

const factInput = sequelize.define('factInput', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    providerGoodId: { type: DataTypes.INTEGER },
    place: { type: DataTypes.STRING },
    unitOfMeasure: { type: DataTypes.STRING },
    quantity: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

providerGoods.hasMany(factInput)
factInput.belongsTo(providerGoods)

module.exports = factInput
