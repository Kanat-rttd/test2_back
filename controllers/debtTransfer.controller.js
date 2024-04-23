const models = require('../models')

class DebtTransferController {
    async getAll(req, res, next) {
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

    async getAllCalculations(req, res, next) {
        const data = await models.debtCalculationView.findAll({
            attributes: ['ClientName', 'Sales', 'Returns', 'Overhead', 'Expenses', 'Payments', 'Credit', 'Debt'],
        })

        let totalDebt = 0
        data.forEach((item) => {
            totalDebt += item.Debt
        })

        const responseData = {
            Data: data,
            Total: totalDebt,
        }

        return res.json(responseData)
    }

    async createDebtTransfer(req, res, next) {
        const debtTransfer = req.body

        console.log(debtTransfer)

        await models.debtTransfer.create({
            dt: debtTransfer.toMagazine,
            kt: debtTransfer.fromProvider,
            amount: debtTransfer.summa,
            transfer_date: debtTransfer.date,
            invoice_number: debtTransfer.invoiceNumber,
            comment: debtTransfer.comment,
            clientId: debtTransfer.fromProvider,
            magazineId: debtTransfer.toMagazine,
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
