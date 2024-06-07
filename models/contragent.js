const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const contragent = sequelize.define('contragent', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    contragentName: { type: DataTypes.STRING },
    type: { type: DataTypes.ENUM(['реализатор','поставщик','цехперсонал', 'магазин']) },
    status: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

module.exports = contragent
