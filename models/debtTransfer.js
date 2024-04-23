const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')
const magazines = require('./magazines')

const debtTransfer = sequelize.define('debtTransfer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dt: { type: DataTypes.STRING },
    kt: { type: DataTypes.STRING },
    amount: { type: DataTypes.INTEGER },
    transfer_date: { type: DataTypes.DATE },
    invoice_number: { type: DataTypes.INTEGER },
    comment: { type: DataTypes.STRING },
    clientId: { type: DataTypes.INTEGER },
    magazineId: { type: DataTypes.INTEGER },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

const debtCalculationView = sequelize.define('DebtCalculationViews', {
    ClientName: { type: DataTypes.STRING },
    Sales: { type: DataTypes.INTEGER },
    Returns: { type: DataTypes.INTEGER },
    Overhead: { type: DataTypes.INTEGER },
    Expenses: { type: DataTypes.INTEGER },
    Payments: { type: DataTypes.INTEGER },
    Credit: { type: DataTypes.INTEGER },
    Debt: { type: DataTypes.INTEGER },
})

clients.hasMany(debtTransfer)
magazines.hasMany(debtTransfer)

debtTransfer.belongsTo(clients)
debtTransfer.belongsTo(magazines)

module.exports = { debtTransfer, debtCalculationView }
// module.exports = debtTransfer
