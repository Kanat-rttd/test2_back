const { Op } = require('sequelize')
const sequelize = require('../config/db')
const models = require('../models')

class DepartPersonalController {
    async getAll(req, res, next) {
        const { status, facilityUnit } = req.query

        let filterOptions = {}
        let filterOptionsFacilityUnit = {}

        if (status) {
            filterOptions.status = status
        }

        if (facilityUnit) {
            filterOptionsFacilityUnit.id = facilityUnit
        }

        const data = await models.departPersonal.findAll({
            attributes: ['id', 'name', 'surname', 'status', 'userClass', 'fixSalary'],
            include: [
                {
                    model: models.bakingFacilityUnits,
                    attributes: ['id', 'facilityUnit'],
                    where: filterOptionsFacilityUnit,
                },
            ],
            where: {
                isDeleted: {
                    [Op.ne]: 1,
                },
                ...filterOptions,
            },
        })

        return res.json(data)
    }

    async createDepartPersonal(req, res, next) {
        const departPersonalData = req.body

        const existingDepartPersonal = await models.departPersonal.findOne({
            where: { isDeleted: false, name: departPersonalData.name },
        })
        if (existingDepartPersonal != null) {
            console.log(existingDepartPersonal)
            throw new Error('Пользователь с таким именем уже существует')
        }

        const tr = await sequelize.transaction()

        try {
            const createdPersonal = await models.departPersonal.create({
                name: departPersonalData.name,
                surname: departPersonalData.surname,
                status: departPersonalData.status,
                userClass: departPersonalData.userClass,
                fixSalary: departPersonalData.fixSalary,
                bakingFacilityUnitId: departPersonalData.bakingFacilityUnitId,
            })

            const finedCantragentType = await models.contragentType.findOne({
                where: { type: 'цехперсонал' },
            })

            await models.contragent.create({
                contragentName: departPersonalData.name,
                status: departPersonalData.status,
                mainId: createdPersonal.id,
                contragentTypeId: finedCantragentType.id,
            })

            await tr.commit()

            return res.status(200).json({ message: 'Персонал успешно создан', data: createdPersonal })
        } catch (error) {
            console.log(error)
            await tr.rollback()
        }
    }

    async updateDepartPersonal(req, res, next) {
        const { id } = req.params
        const { name, userClass, surname, status, fixSalary, bakingFacilityUnitId } = req.body

        const findedPersonal = await models.departPersonal.findByPk(id)

        const updateObj = {
            name,
            surname,
            status,
            userClass,
            fixSalary,
            bakingFacilityUnitId,
        }

        if (name !== findedPersonal.name) {
            const existingDepartPersonal = await models.departPersonal.findOne({
                where: { isDeleted: false, name },
            })
            if (existingDepartPersonal != null) {
                console.log(existingDepartPersonal)
                throw new Error('Пользователь с таким именем уже существует')
            }
        }

        const tr = await sequelize.transaction()

        try {
            await models.contragent.update(
                { contragentName: name, status },
                { where: { contragentName: findedPersonal.name } },
            )

            const upadatedPersonal = await models.departPersonal.update(updateObj, {
                where: {
                    id,
                },
                individualHooks: true,
            })
            await tr.commit()

            return res.status(200).json({ message: 'Персонал успешно обновлен', data: upadatedPersonal })
        } catch (error) {
            console.log(error)
            await tr.rollback()
        }
    }

    async deletePersonal(req, res) {
        const { id } = req.params

        const tr = await sequelize.transaction()

        try {
            const findedPersonal = await models.departPersonal.findByPk(id)

            await models.contragent.update(
                {
                    isDeleted: true,
                },
                {
                    where: { contragentName: findedPersonal.name },
                },
            )

            const deletedUser = await models.departPersonal.update(
                { isDeleted: true },
                {
                    where: {
                        id,
                    },
                },
            )

            await tr.commit()

            return res.status(200).json({ message: 'Персонал успешно удален', data: deletedUser })
        } catch (error) {
            console.log(error)
            await tr.rollback()
        }
    }
}

module.exports = new DepartPersonalController()
