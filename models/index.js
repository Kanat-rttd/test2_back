// const users = require('./users.js')
// const requests = require('./requests.js')
const { goodsDispatch, invoiceData } = require('./goodsDispatch.js')
const { shiftAccounting, shiftAccountingDetails } = require('./shiftAccounting.js')
const { debtTransfer, debtCalculationView } = require('./debtTransfer.js')
const {
    breadReportView,
    shiftTimeView,
    magazineDebtView,
    salesReportView,
    reportView,
    purchaseDebtView,
} = require('./reports.js')
const { inventorizations } = require('./inventorizationView.js')
const { baking, bakingDetails } = require('./baking.js')
const { overPrices, overPriceDetails } = require('./overPrice.js')

module.exports = {
    contragent: require('./contragent.js'),
    contragentType: require('./contragentType.js'),
    users: require('./users.js'),
    requests: require('./requests.js'),
    clients: require('./clients.js'),
    products: require('./products.js'),
    baking,
    bakingDetails,
    user: require('./users.js'),
    order: require('./order.js'),
    orderDetails: require('./orderDetails.js'),
    individualPrices: require('./individualPrices.js'),
    bakingFacilityUnits: require('./bakeryFacilityUnits.js'),
    goodsDispatchDetails: require('./goodsDispatchDetails.js'),
    finance: require('./finance.js'),
    financeCategories: require('./financeCategories.js'),
    financeAccount: require('./financeAccount.js'),
    productPurchase: require('./productPurchase.js'),
    providers: require('./providers.js'),
    goodsCategories: require('./goodsCategories.js'),
    goodsDispatch,
    invoiceData,
    magazines: require('./magazines.js'),
    debtTransfer,
    debtCalculationView,
    departPersonal: require('./departPersonal.js'),
    shiftAccounting,
    shiftAccountingDetails,
    overPrices,
    overPriceDetails,
    breadReportView,
    salesReportView,
    reportView,
    shiftTimeView,
    magazineDebtView,
    factInput: require('./factInput.js'),
    providerGoods: require('./providerGoods.js'),
    place: require('./places.js'),
    adjustments: require('./adjustments.js'),
    inventorizations,
    purchaseDebtView,
}
