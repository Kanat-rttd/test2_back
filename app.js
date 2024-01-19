require('dotenv').config()
const express = require('express')
const sequelize = require('./config/db')
const models = require('./models')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./routes/index')
const path = require('path')
const PORT = process.env.PORT || 5001
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'images')))
app.use('/api', router)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync({ alter: true })
        app.listen(PORT, () => console.log(`App started on port ${PORT}`))
    } catch (e) {
        console.error(e.message)
    }
}
start()
