const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const providers = require('./providers')

const providerGoods = sequelize.define('providerGoods', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    providerId: { type: DataTypes.INTEGER },
    goods: { type: DataTypes.STRING },
    unitOfMeasure: { type: DataTypes.STRING },
    place: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

providers.hasMany(providerGoods)
providerGoods.belongsTo(providers)

module.exports = providerGoods
