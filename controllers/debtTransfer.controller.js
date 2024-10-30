const models = require('../models')

class DebtTransferController {
    async getAll(req, res) {
        const data = await models.debtTransfer.findAll({
            attributes: ['id', 'dt', 'kt', 'amount', 'transfer_date', 'invoice_number', 'comment'],
            include: [
                {
                    attributes: ['id', 'name'],
                    model: models.clients,
                },
                {
                    attributes: ['id', 'name'],
                    model: models.magazines,
                },
            ],
        })
        return res.json(data)
    }

    async getAllCalculations(req, res) {
        const { contragentName } = req.query

        const data = await models.debtCalculationView.findAll({
            attributes: ['client', 'debt'],
            where: {
                ...(contragentName ? { client: contragentName } : {}),
            },
        })

        const responseData = {
            Data: data,
            Total: data.reduce((acc, cur) => acc + cur.getDataValue('debt'), 0),
        }

        return res.json(responseData)
    }

    async createDebtTransfer(req, res) {
        const debtTransfer = req.body

        console.log(debtTransfer)

        await models.debtTransfer.create({
            dt: debtTransfer.to,
            kt: debtTransfer.from,
            amount: debtTransfer.summa,
            transfer_date: debtTransfer.date,
            invoice_number: debtTransfer.invoiceNumber,
            comment: debtTransfer.comment,
        })
        return res.status(200).send('debtTransfer Created')
    }

    // async updateMagazine(req, res, next) {
    //     const { id } = req.params

    //     const magazineData = req.body

    //     const updateObj = {
    //         name: magazineData.name,
    //         clientId: magazineData.clientId,
    //         status: magazineData.status,
    //     }

    //     await models.magazines.update(updateObj, {
    //         where: {
    //             id,
    //         },
    //     })

    //     return res.status(200).send('Magazine updated')
    // }

    // async deleteMagazine(req, res, next) {
    //     const { id } = req.params
    //     await models.magazines.update(
    //         {
    //             isDeleted: true,
    //         },
    //         {
    //             where: {
    //                 id,
    //             },
    //         },
    //     )
    //     return res.status(200).json({ id: id })
    // }
}

module.exports = new DebtTransferController()
