const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const departPersonal = sequelize.define(
    'departPersonal',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING },
        surname: { type: DataTypes.STRING },
        status: { type: DataTypes.STRING },
        userClass: { type: DataTypes.STRING },
        fixSalary: { type: DataTypes.STRING },
        isDeleted : {type: DataTypes.BOOLEAN , defaultValue: false}
    },
    {
        indexes: [
            {
                unique: true,
                fields: ['name'],
                name: 'name_unique_constraint',
                msg: 'Пользователь с таким именем уже существует',
            },
        ],
    },
)

module.exports = departPersonal
