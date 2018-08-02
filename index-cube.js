require('dotenv').config();
const discord = require('discord.js');
const logger = require('./app/tools/logger');

const bot = new discord.Client();

const {incomingMessage} = require('./app/message-controller.js');

var scramble = require('./app/tools/scramble.js')

bot.on('ready', () => logger.log('info', 'Bot ready'), scramble);

bot.on('message', incomingMessage);
bot.login(process.env.TOKEN);
