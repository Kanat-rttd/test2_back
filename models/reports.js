const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const breadReportView = sequelize.define('BreadReportViews', {
    Date: { type: DataTypes.DATE },
    Products: { type: DataTypes.STRING },
})

const shiftTimeView = sequelize.define('shiftTimeViews', {
    Date: { type: DataTypes.DATE },
    personalId: { type: DataTypes.STRING },
    personalName: { type: DataTypes.STRING },
    totalHours: { type: DataTypes.INTEGER },
})

const magazineDebtView = sequelize.define('magazineDebtViews', {
    MagazineName: { type: DataTypes.STRING },
    Debit: { type: DataTypes.INTEGER },
})

module.exports = { breadReportView, shiftTimeView, magazineDebtView }
