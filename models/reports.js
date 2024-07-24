const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const breadReportView = sequelize.define('BreadReportViews', {
    Date: { type: DataTypes.DATE },
    Products: { type: DataTypes.STRING },
})

const reportView = sequelize.define(
    'ReportView',
    {
        ClientName: { type: DataTypes.STRING },
        adjustedDate: { type: DataTypes.DATE },
        Sales: { type: DataTypes.INTEGER },
        Returns: { type: DataTypes.INTEGER },
        Overhead: { type: DataTypes.INTEGER },
        Expenses: { type: DataTypes.INTEGER },
        Payments: { type: DataTypes.INTEGER },
        Credit: { type: DataTypes.INTEGER },
        Debt: { type: DataTypes.INTEGER },
    },
    {
        tableName: 'ReportView',
    },
)

const salesReportView = sequelize.define(
    'SalesView',
    {
        contragentName: { type: DataTypes.STRING },
        name: { type: DataTypes.STRING },
        adjustedDate: { type: DataTypes.DATE },
        SalesQuantity: { type: DataTypes.INTEGER },
    },
    {
        tableName: 'SalesView',
    },
)

const shiftTimeView = sequelize.define('shiftTimeViews', {
    Date: { type: DataTypes.DATE },
    personalId: { type: DataTypes.STRING },
    personalName: { type: DataTypes.STRING },
    totalHours: { type: DataTypes.INTEGER },
})

const magazineDebtView = sequelize.define('magazinedebtviews', {
    MagazineName: { type: DataTypes.STRING },
    Debit: { type: DataTypes.INTEGER },
})

const purchaseDebtView = sequelize.define(
    'PurchaseDebtView',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true },
        providerName: { type: DataTypes.STRING },
        totalDebt: { type: DataTypes.INTEGER },
        totalFinanceAmount: { type: DataTypes.INTEGER },
        debt: { type: DataTypes.INTEGER },
        status: { type: DataTypes.STRING },
    },
    {
        tableName: 'PurchaseDebtView',
    },
)

module.exports = { breadReportView, shiftTimeView, magazineDebtView, salesReportView, reportView, purchaseDebtView }
