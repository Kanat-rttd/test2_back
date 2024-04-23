const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')
const departPersonal = require('./departPersonal')

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

module.exports = { breadReportView, shiftTimeView }
