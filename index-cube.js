require('dotenv').config();
const discord = require('discord.js');
const logger = require('./app/tools/logger');
const {incomingMessage} = require('./app/controllers/message-controller.js');
const {startCron, stopCron} = require('./app/controllers/cron-controller');

const bot = new discord.Client();
bot.on('ready', () => {
  logger.log('info', 'Bot ready');
  startCron(bot);
});

bot.on('message', incomingMessage);
bot.login(process.env.TOKEN);

process.on('exit', () => {
  stopCron();
  require('mongoose').disconnect();
  logger.log('info', 'Exiting');
});
