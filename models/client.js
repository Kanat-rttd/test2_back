const sequelize = require('../db')
const { DataTypes } = require('sequelize')

const client = sequelize.define('client', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
})

module.exports = {
    client,
}
