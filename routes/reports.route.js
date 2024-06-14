const { Router } = require('express')

const Controller = require('../controllers/report.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/bread', catchAsync(Controller.breadViewReport))
router.get('/time', catchAsync(Controller.shiftTimeView))
router.get('/magazineDebt', catchAsync(Controller.magazineDebtView))
router.get('/inventoryzation', catchAsync(Controller.inventoryzationView))
router.get('/sales', catchAsync(Controller.getSalesReportView))
router.get('/reconciliation', catchAsync(Controller.getReconciliationReportView))

module.exports = router
