// const users = require('./users.js')
// const requests = require('./requests.js')
const { goodsDispatch, invoiceData } = require('./goodsDispatch.js')

module.exports = {
    users: require('./users.js'),
    requests: require('./requests.js'),
    clients: require('./clients.js'),
    products: require('./products.js'),
    baking: require('./baking.js'),
    user: require('./users.js'),
    order: require('./order.js'),
    orderDetails: require('./orderDetails.js'),
    individualPrices: require('./individualPrices.js'),
    bakingFacilityUnits: require('./bakeryFacilityUnits.js'),
    goodsDispatchDetails: require('./goodsDispatchDetails.js'),
    finance: require('./finance.js'),
    financeCategories: require('./financeCategories.js'),
    productPurchase: require('./productPurchase.js'),
    providers: require('./providers.js'),
    rawMaterials: require('./rawMaterials.js'),
    goodsDispatch,
    invoiceData,
    magazines: require('./magazines.js'),
}
