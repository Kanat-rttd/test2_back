const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const contragent = require('./contragent')

const overPrices = sequelize.define(
    'overPrices',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        price: { type: DataTypes.INTEGER },
        contragentId: { type: DataTypes.INTEGER },
        month: { type: DataTypes.INTEGER },
        year: { type: DataTypes.INTEGER },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        hooks: {
            beforeCreate: async (overPrice) => {
                const { contragentId, month, year } = overPrice

                const existingOverPrice = await overPrices.findOne({
                    where: {
                        contragentId,
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
                const { contragentId, month, year } = overPrice
                const currentOverPrice = await overPrices.findByPk(overPrice.id)

                console.log(
                    'Previous values:',
                    currentOverPrice.contragentId,
                    currentOverPrice.month,
                    currentOverPrice.year,
                )
                console.log('New values:', contragentId, month, year)

                if (
                    currentOverPrice.contragentId != contragentId ||
                    currentOverPrice.month != month ||
                    currentOverPrice.year != year
                ) {
                    const existingOverPrice = await overPrices.findOne({
                        where: {
                            contragentId,
                            month,
                            year,
                            isDeleted: false,
                        },
                    })

                    if (existingOverPrice) {
                        throw new Error('Для данного реализатора в указанном месяце уже существует активная запись')
                    }
                }
            },
        },
    },
)

contragent.hasMany(overPrices)
overPrices.belongsTo(contragent)

module.exports = overPrices
