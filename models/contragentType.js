const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const contragentType = sequelize.define('contragentType', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING },
})

module.exports = contragentType
