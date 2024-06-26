const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const clients = require('./clients')

const magazines = sequelize.define(
    'magazines',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING },
        clientId: { type: DataTypes.INTEGER },
        status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        hooks: {
            beforeCreate: async (magazine) => {
                const existingMagazine = await magazines.findOne({
                    where: {
                        name: magazine.name,
                        isDeleted: false,
                    },
                })

                if (existingMagazine) {
                    throw new Error('Магазин с таким именем уже существует')
                }
            },
            beforeUpdate: async (magazine) => {
                const currentMagazine = await magazines.findByPk(magazine.id)

                if (magazine.name !== currentMagazine.name) {
                    const existingMagazine = await magazines.findOne({
                        where: {
                            name: magazine.name,
                            isDeleted: false,
                        },
                    })

                    if (existingMagazine) {
                        throw new Error('Магазин с таким именем уже существует')
                    }
                }
            },
        },
    },
)

clients.hasMany(magazines)
magazines.belongsTo(clients)

module.exports = magazines
