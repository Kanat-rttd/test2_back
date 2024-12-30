const { Router } = require('express')

const Controller = require('../controllers/report.controller')
const catchAsync = require('../filters/catchAsync')

let router = Router()

router.get('/bread', catchAsync(Controller.breadViewReport))
router.get('/time', catchAsync(Controller.shiftTimeView))
router.get('/magazineDebt', catchAsync(Controller.magazineDebtView))
router.get('/inventoryzation', catchAsync(Controller.inventoryzationView))
router.get('/sales', catchAsync(Controller.getSalesReportView))
router.get('/generalReconciliation', catchAsync(Controller.getGeneralReconciliationReportView))
router.get('/reconciliation', catchAsync(Controller.getReconciliation))
router.get('/remainRawMaterials', catchAsync(Controller.getRemainRawMaterials))
router.get('/remainProducts', catchAsync(Controller.getRemainProducts))
router.get('/purchaseDebts', catchAsync(Controller.getDebtPurchases))

module.exports = router
