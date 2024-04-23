const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const bakingFacility = require('./bakeryFacilityUnits')
const departPersonal = require('./departPersonal')

const shiftAccounting = sequelize.define('shiftAccounting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATE },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    bakingFacilityUnitId: { type: DataTypes.INTEGER },
})

const shiftAccountingDetails = sequelize.define('shiftAccountingDetails', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    shiftAccountingId: { type: DataTypes.INTEGER },
    departPersonalId: { type: DataTypes.INTEGER },
    shiftTime: { type: DataTypes.INTEGER },
})

bakingFacility.hasMany(shiftAccounting)
departPersonal.hasMany(shiftAccountingDetails)

shiftAccounting.belongsTo(bakingFacility)
shiftAccountingDetails.belongsTo(departPersonal)

shiftAccounting.hasMany(shiftAccountingDetails)

shiftAccountingDetails.belongsTo(shiftAccounting)

module.exports = { shiftAccounting, shiftAccountingDetails }
