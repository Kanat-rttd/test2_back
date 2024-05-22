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

        await models.departPersonal.create({
            name: departPersonalData.name,
            surname: departPersonalData.surname,
            status: departPersonalData.status,
            userClass: departPersonalData.userClass,
            fixSalary: departPersonalData.fixSalary,
            bakingFacilityUnitId: departPersonalData.bakingFacilityUnitId
        })

        return res.status(200).send('Personal Created')
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
            bakingFacilityUnitId
        }

        await models.departPersonal.update(updateObj, {
            where: {
                id,
            },
        })
        return res.status(200).send('Personal updated')
    }

    async deletePersonal(req, res) {
        const { id } = req.params

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
