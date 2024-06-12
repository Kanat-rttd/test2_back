const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const products = sequelize.define(
    'products',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING },
        price: { type: DataTypes.INTEGER },
        costPrice: { type: DataTypes.INTEGER },
        status: { type: DataTypes.STRING },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        hooks: {
            beforeCreate: async (product) => {
                const existingProduct = await products.findOne({
                    where: {
                        name: product.name,
                        isDeleted: false,
                    },
                })

                if (existingProduct) {
                    throw new Error('Продукт с таким названием уже существует')
                }
            },
            beforeUpdate: async (product) => {
                const currentProduct = await products.findByPk(product.id)

                if (product.name !== currentProduct.name) {
                    const existingProduct = await products.findOne({
                        where: {
                            name: product.name,
                            isDeleted: false,
                        },
                    })

                    if (existingProduct) {
                        throw new Error('Продукт с таким названием уже существует')
                    }
                }
            },
        },
    },
)

module.exports = products
