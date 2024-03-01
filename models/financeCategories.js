const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const financeCategories = sequelize.define('financeCategories', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    type: { type: DataTypes.STRING },
})

module.exports = financeCategories
