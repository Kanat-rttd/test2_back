const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const rawMaterials = sequelize.define('rawMaterials', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    uom: { type: DataTypes.STRING },
})

module.exports = rawMaterials
