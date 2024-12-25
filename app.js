// process.env.TZ = 'Asia/Almaty'
require('dotenv').config()
const express = require('express')
const errorHandler = require('./filters/errorHandler')
const sequelize = require('./config/db')
const models = require('./models')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./routes/index')
const path = require('path')
const { bot } = require('./lib/telegram/bot')

const PORT = process.env.PORT || 5001
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'images')))
app.use('/api', router)

app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        sequelize.sync({ alter: true }).then(() => console.debug('Database synchonized'))

        bot.launch(() => console.log('Bot is running'))
        app.listen(PORT, () => console.log(`App started on port ${PORT}`))
    } catch (e) {
        console.error(e.message)
    }
}

start()
