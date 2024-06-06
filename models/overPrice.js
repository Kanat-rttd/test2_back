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
                const { clientId, month, year } = overPrice

                const existingOverPrice = await overPrices.findOne({
                    where: {
                        clientId,
                        month,
                        year,
                        isDeleted: false,
                    },
                })

                if (existingOverPrice) {
                    throw new Error('Для данного реализатора в указанном месяце уже существует активная запись')
                }
            },
            beforeUpdate: async (overPrice) => {
                const { clientId, month, year } = overPrice

                const existingOverPrice = await overPrices.findOne({
                    where: {
                        clientId,
                        month,
                        year,
                        isDeleted: false,
                    },
                })
                console.log('11111111111', overPrice);
                console.log('22222222222', existingOverPrice);

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
