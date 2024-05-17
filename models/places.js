const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const place = sequelize.define('place', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
})

module.exports = place
