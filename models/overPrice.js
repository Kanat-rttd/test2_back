const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const client = require('./clients')

const overPrices = sequelize.define(
    'overPrices',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        price: { type: DataTypes.INTEGER },
        clientId: { type: DataTypes.INTEGER },
        month: { type: DataTypes.INTEGER },
        year: { type: DataTypes.INTEGER },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        hooks: {
            beforeCreate: async (overPrice) => {
                const existingOverPrice = await overPrices.findOne({
                    where: {
                        clientId: overPrice.clientId,
                        month: overPrice.month,
                        year: overPrice.year,
                        isDeleted: false,
                    },
                })

                if (existingOverPrice) {
                    throw new Error('Для данного реализатора в указанном месяце уже существует активная запись')
                }
            },
            beforeUpdate: async (overPrice) => {
                const existingOverPrice = await overPrices.findOne({
                    where: {
                        clientId: overPrice.clientId,
                        month: overPrice.month,
                        year: overPrice.year,
                        isDeleted: false,
                    },
                })

                if (existingOverPrice) {
                    throw new Error('Для данного реализатора в указанном месяце уже существует активная запись')
                }
            },
        },
    },
)

client.hasMany(overPrices)

overPrices.belongsTo(client)

module.exports = overPrices
