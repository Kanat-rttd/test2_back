const { Op } = require('sequelize')
const models = require('../models')

class DepartPersonalController {
    async getAll(req, res, next) {
        const { status } = req.query
        console.log('query Recieved', status)
        let filterOptions = {}
        if (status) {
            filterOptions.status = status
        }

        const data = await models.departPersonal.findAll({
            attributes: ['id', 'name', 'surname', 'status', 'userClass', 'fixSalary'],
            include: [
                {
                    model: models.bakingFacilityUnits,
                    attributes: ['id', 'facilityUnit'],
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

        const createdPersonal = await models.departPersonal.create({
            name: departPersonalData.name,
            surname: departPersonalData.surname,
            status: departPersonalData.status,
            userClass: departPersonalData.userClass,
            fixSalary: departPersonalData.fixSalary,
            bakingFacilityUnitId: departPersonalData.bakingFacilityUnitId,
        })

        await models.contragent.create({
            contragentName: departPersonalData.name,
            status: departPersonalData.status,
            type: 'цехперсонал',
        })

        return res.status(200).json({ message: 'Персонал успешно создан', data: createdPersonal })
    }

    async updateDepartPersonal(req, res, next) {
        const { id } = req.params

        const { name, userClass, surname, status, fixSalary, bakingFacilityUnitId } = req.body

        const updateObj = {
            name,
            surname,
            status,
            userClass,
            fixSalary,
            bakingFacilityUnitId,
        }

        const findedPersonal = await models.departPersonal.findByPk(id)

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

        return res.status(200).json({ message: 'Персонал успешно обновлен', data: upadatedPersonal })
    }

    async deletePersonal(req, res) {
        const { id } = req.params

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
        return res.status(200).json({ message: 'Персонал успешно удален', data: deletedUser })
    }
}

module.exports = new DepartPersonalController()
