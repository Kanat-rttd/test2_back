const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const baking = sequelize.define('baking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    breadType: { type: DataTypes.STRING },
    flour: { type: DataTypes.INTEGER },
    salt: { type: DataTypes.INTEGER },
    yeast: { type: DataTypes.INTEGER },
    malt: { type: DataTypes.INTEGER },
    butter: { type: DataTypes.INTEGER },
    temperature: { type: DataTypes.INTEGER },
    time: { type: DataTypes.DATE },
    output: { type: DataTypes.INTEGER },
    spoilage: { type: DataTypes.INTEGER },
})

module.exports = baking
