const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const contragentType = require('./contragentType')

const contragent = sequelize.define('contragent', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mainId: { type: DataTypes.INTEGER },
    contragentName: { type: DataTypes.STRING },
    contragentTypeId: { type: DataTypes.INTEGER },
    status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

contragentType.hasMany(contragent)
contragent.belongsTo(contragentType)

module.exports = contragent
