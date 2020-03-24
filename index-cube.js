require('dotenv').config();
const discord = require('discord.js');
const logger = require('./app/tools/logger');
const { incomingMessage } = require('./app/controllers/message-controller');
const { startCron, stopCron } = require('./app/controllers/cron-controller');

const bot = new discord.Client();

bot.on('ready', () => {
  logger.log('info', 'Bot ready');
  startCron(bot);
  bot.user.setPresence({
    activity: { name: 'for new PB | ?h', type: 3 },
  });
});

bot.on('message', incomingMessage);
bot.login(process.env.TOKEN);

process.on('exit', () => {
  stopCron();
  require('mongoose').disconnect();
  logger.log('info', 'Exiting');
});
