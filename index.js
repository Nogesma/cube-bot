import mongoose from 'mongoose';
import discord, { Intents } from 'discord.js';
import express from 'express';
import cookieParser from 'cookie-parser';

import { incomingMessage } from './app/controllers/messages-controller.js';
import logger from './app/tools/logger.js';
import { startCron, stopCron } from './app/controllers/crons-controller.js';
import { api, oauth } from './app/controllers/routes-controller.js';

const bot = new discord.Client({
  intents: [
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

const app = express();
const port = 3000;

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/test');

bot.on('ready', () => {
  logger.info('Bot ready');
  startCron(bot);
  bot.user.setActivity({ name: 'for new PB | ?h', type: 3 });
});

bot.on('messageCreate', incomingMessage);
bot.login(process.env.TOKEN);

app.use(express.json());
app.use((req, res, next) => {
  req.bot = bot;
  next();
});
app.use(cookieParser());

app.get('/api/oauth/discord/:code', oauth);
app.use('/api', api);

app.listen(port, () => {
  logger.info(`Server listenning on port ${port}`);
});

process.on('exit', () => {
  stopCron();
  mongoose.disconnect();
  logger.info('Exiting');
});
