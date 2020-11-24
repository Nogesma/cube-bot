import mongoose from 'mongoose';
import discord from 'discord.js';
import express from 'express';
import cookieParser from 'cookie-parser';

import { incomingMessage } from './app/controllers/messages-controller.js';
import logger from './app/tools/logger.js';
import { startCron, stopCron } from './app/controllers/crons-controller.js';
import { api, oauth } from './app/controllers/routes-controller.js';
const bot = new discord.Client();
const app = express();
const port = 3000;

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

// bot.on('ready', () => {
//   logger.info('Bot ready');
//   startCron(bot);
//   bot.user.setPresence({
//     activity: { name: 'for new PB | ?h', type: 3 },
//   });
// });
//
// bot.on('message', incomingMessage);
// bot.login(process.env.TOKEN);

app.use(express.json());
app.use((req, res, next) => {
  req.bot = bot;
  next();
});
app.use(cookieParser());

app.use('/api', api);
app.get('/oauth/discord/:code', oauth);

app.listen(port, () => {
  logger.info(`Server listenning on port ${port}`);
});

process.on('exit', () => {
  stopCron();
  mongoose.disconnect();
  logger.info('Exiting');
});
