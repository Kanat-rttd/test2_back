const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const debtTransfer = sequelize.define('debtTransfer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dt: { type: DataTypes.STRING },
    kt: { type: DataTypes.STRING },
    amount: { type: DataTypes.INTEGER },
    transfer_date: { type: DataTypes.DATE },
    invoice_number: { type: DataTypes.INTEGER },
    comment: { type: DataTypes.STRING },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
})

const debtCalculationView = sequelize.define('DebtCalculationViews', {
    client: { type: DataTypes.STRING },
    month: { type: DataTypes.INTEGER },
    year: { type: DataTypes.INTEGER },
    sales: { type: DataTypes.INTEGER },
    returns: { type: DataTypes.INTEGER },
    overhead: { type: DataTypes.INTEGER },
    expenses: { type: DataTypes.INTEGER },
    payments: { type: DataTypes.INTEGER },
    credit: { type: DataTypes.INTEGER },
    debit: { type: DataTypes.INTEGER },
    debt: { type: DataTypes.INTEGER },
})

module.exports = { debtTransfer, debtCalculationView }
// module.exports = debtTransfer
