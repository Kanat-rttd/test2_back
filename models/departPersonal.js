const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const bakeryFacilityUnits = require('./bakeryFacilityUnits')

const departPersonal = sequelize.define(
    'departPersonal',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING },
        surname: { type: DataTypes.STRING },
        status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        userClass: { type: DataTypes.STRING },
        fixSalary: { type: DataTypes.STRING },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        hooks: {
            beforeCreate: async (personal) => {
                const existingPersonal = await departPersonal.findOne({
                    where: {
                        name: personal.name,
                        isDeleted: false,
                    },
                })

                if (existingPersonal) {
                    throw new Error('Пользователь с таким именем уже существует')
                }
            },
            beforeUpdate: async (personal) => {
                const currentPersonal = await departPersonal.findByPk(personal.id)

                if (personal.name !== currentPersonal.name) {
                    const existingPersonal = await departPersonal.findOne({
                        where: {
                            name: personal.name,
                            isDeleted: false,
                        },
                    })

                    if (existingPersonal) {
                        throw new Error('Пользователь с таким именем уже существует')
                    }
                }
            },
        },
    },
)

bakeryFacilityUnits.hasMany(departPersonal)
departPersonal.belongsTo(bakeryFacilityUnits)

module.exports = departPersonal
