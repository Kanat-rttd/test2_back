const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const providers = require('./providers')

const providerGoods = sequelize.define(
    'providerGoods',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        providerId: { type: DataTypes.INTEGER },
        goods: { type: DataTypes.STRING },
        unitOfMeasure: { type: DataTypes.STRING },
        place: { type: DataTypes.STRING },
        status: { type: DataTypes.STRING },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        hooks: {
            beforeCreate: async (product) => {
                const existingProduct = await providerGoods.findOne({
                    where: {
                        goods: product.goods,
                        isDeleted: false,
                    },
                })

                if (existingProduct) {
                    throw new Error('Товар с таким названием уже существует')
                }
            },
            beforeUpdate: async (product) => {
                const currentProduct = await providerGoods.findByPk(product.id)

                if (product.goods !== currentProduct.goods) {
                    const existingProduct = await providerGoods.findOne({
                        where: {
                            goods: product.goods,
                            isDeleted: false,
                        },
                    })

                    if (existingProduct) {
                        throw new Error('Товар с таким названием уже существует')
                    }
                }
            },
        },
    },
)

providers.hasMany(providerGoods)
providerGoods.belongsTo(providers)

// providerGoods.sync({alter: false}) //TODO: Закомментировать

module.exports = providerGoods
