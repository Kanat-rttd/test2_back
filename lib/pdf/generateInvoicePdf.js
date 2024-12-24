const PDFDocument = require('pdfkit')
const dayjs = require('dayjs')
const fs = require('fs')
const path = require('path')

/**
 * @typedef Product
 * @prop {string} name
 * @prop {number} price
 * @prop {number} quantity
 * @prop {number} totalPrice
 */

/**
 * @typedef Invoice
 * @prop {string} contragentName
 * @prop {number} invoiceNumber
 * @prop {number} totalSum
 * @prop {Product[]} totalProducts
 * @prop {Date} createdAt
 */

/**
 * @param {Invoice} invoice
 * @param {number} overhead
 */
async function generateInvoicePdf(invoice, overhead) {
    const Roboto = path.join(process.cwd(), 'assets', 'fonts', 'Roboto', 'Roboto-Regular.ttf')
    const RobotoBold = path.join(process.cwd(), 'assets', 'fonts', 'Roboto', 'Roboto-Bold.ttf')

    const doc = new PDFDocument({
        lang: 'ru',
        layout: 'portrait',
        size: 'A4',
        font: fs.readFileSync(Roboto),
    })
    const left = 50
    let top = 50

    doc.fontSize(14)

    /**
     * Base info
     */
    doc.text(`#${invoice.invoiceNumber}`, left, top)

    top += 30
    doc.text('Расходная накладная от', left, top, { align: 'left' })
    doc.text(dayjs(invoice.createdAt).format('DD.MM.YYYY'), left, top, {
        align: 'right',
    })

    top += 25
    generateHr(doc, left, top)

    top += 25
    doc.text('Получатель', left, top, { align: 'left' })
    doc.text(invoice.recipient ?? '', left, top, { align: 'right' })

    top += 20
    doc.text('Покупатель', left, top, { align: 'left' })
    doc.text(invoice.contragentName, left, top, { align: 'right' })

    /**
     * Table
     */
    top += 50
    generateTableRow(doc, left, top, 'Название', 'Количество', 'Цена', 'Сумма')

    top += 25
    generateHr(doc, left, 225)

    for (let i = 0; i < invoice.totalProducts.length; i++) {
        const product = invoice.totalProducts[i]
        top += 25
        generateTableRow(
            doc,
            left,
            top,
            product.name,
            product.quantity,
            `${product.price.toLocaleString('ru-KZ')} тг`,
            `${product.totalPrice.toLocaleString('ru-KZ')} тг`,
        )
    }

    /**
     * Totals
     */
    top += 50
    doc.text('Получено __________', left, top, { align: 'right' })

    top += 50
    doc.font(RobotoBold).text(`Сверху: ${overhead.toLocaleString('ru-KZ')} тг`, left, top, { align: 'right' })

    top += 20
    doc.text(`Всего: ${invoice.totalSum.toLocaleString('ru-KZ')} тг`, left, top, { align: 'right' })

    return doc
}

function generateHr(doc, left, top) {
    doc.strokeColor('#000')
        .opacity(0.6)
        .lineWidth(2)
        .moveTo(left, top)
        .lineTo(left + 480, top)
        .stroke()
        .strokeColor('#000')
        .opacity(1)
}

/**
 *
 * @param {import('pdfkit')} doc
 * @param {*} top
 * @param {*} c1
 * @param {*} c2
 * @param {*} c3
 * @param {*} c4
 */
function generateTableRow(doc, left, top, c1, c2, c3, c4) {
    console.log(left, top)
    doc.text(c1, left, top, { width: 200, height: 40 })
        .text(c2, left + 200, top, { width: 90, height: 40, align: 'right' })
        .text(c3, left + 280, top, { width: 90, height: 40, align: 'right' })
        .text(c4, left, top, { align: 'right', height: 40 })
}

module.exports = { generateInvoicePdf }
