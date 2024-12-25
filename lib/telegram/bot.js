require('dotenv').config()
const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

/**
 * Send a message to a user in Telegram
 * @param {string} chatId - Telegram chat ID
 * @param {string} message - Message to send
 * @return {Promise<void>}
 */
async function sendTelegramMessage(chatId, message) {
    const completeMessage = message.replace(/[!-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

    await bot.telegram.sendMessage(chatId, completeMessage, {
        parse_mode: 'MarkdownV2',
    })
}

module.exports = { bot, sendTelegramMessage }
