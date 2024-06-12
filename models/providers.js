const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')

const providers = sequelize.define(
    'providers',
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        providerName: { type: DataTypes.STRING },
        status: { type: DataTypes.STRING },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
        hooks: {
            beforeCreate: async (provider) => {
                const existingProvider = await providers.findOne({
                    where: {
                        providerName: provider.providerName,
                        isDeleted: false,
                    },
                })

                if (existingProvider) {
                    throw new Error('Поставщик с таким названием уже существует')
                }
            },
            beforeUpdate: async (provider) => {
                const currentProvider = await providers.findByPk(provider.id)

                if (provider.providerName !== currentProvider.providerName) {
                    const existingProvider = await providers.findOne({
                        where: {
                            providerName: provider.providerName,
                            isDeleted: false,
                        },
                    })

                    if (existingProvider) {
                        throw new Error('Поставщик с таким названием уже существует')
                    }
                }
            },
        },
    },
)

module.exports = providers
