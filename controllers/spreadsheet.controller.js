const Excel = require('exceljs')

class SpreadsheetController {
    /**
     * @param {import('express').Request} req
     * @param {string} req.body.sheetName
     * @param {any[][]} req.body.data
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     * */
    async createWorkBook(req, res, next) {
        const { sheetName, data } = req.body
        const workBook = new Excel.Workbook()
        const worksheet = workBook.addWorksheet(sheetName)
        const maxColumns = Math.max(...data.map((row) => row.length))
        const lastColumn = String.fromCharCode(64 + maxColumns)

        worksheet.mergeCells(`A1:${lastColumn}1`)
        worksheet.getCell('A1').value = sheetName
        worksheet.getCell('A1').alignment = {
            vertical: 'middle',
            horizontal: 'center',
        }
        worksheet.getCell('A1').font = { bold: true, size: 16 }

        worksheet.addRow([])
        worksheet.addRows(data)

        worksheet.columns.forEach((col) => {
            col.width = 20
        })

        worksheet.eachRow({ includeEmpty: true }, (row) => {
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } },
                }
            })
        })

        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', 'attachment; filename=' + `report.xlsx`)
        await workBook.xlsx.write(res)
        res.end()
    }
}

module.exports = new SpreadsheetController()
