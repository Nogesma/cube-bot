import mongoose from 'mongoose';
import discord from 'discord.js';
import { incomingMessage } from './app/controllers/message-controller.js';
import logger from './app/tools/logger.js';
import { startCron, stopCron } from './app/controllers/cron-controller.js';

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
  mongoose.disconnect();
  logger.log('info', 'Exiting');
});
