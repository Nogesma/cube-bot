const fs = require('fs-extra');
const moment = require('moment');
const {CronJob} = require('cron');
const logger = require('./tools/logger');
const {updateStandings} = require('./controllers/cube-db');
const {
  sendScrambles,
  event333
} = require('./controllers/scrambler');

const cronList_ = [];

const startCron = bot => {
  cronList_.push(new CronJob({
    cronTime: '00 00 02 * * *',
    onTick: async () => {
      await fs.remove('./tmp');
      await fs.ensureDir('./tmp');
      logger.log('info', 'tmp dir cleaned');
    },
    start: false,
    timeZone: 'Europe/Paris'
  }));

  cronList_.push(new CronJob({
    cronTime: '00 01 00 * * *',
    onTick: async () => {
      const channel333 = bot.channels.get(process.env.CHANNEL_333);
      await updateStandings(moment().format('YYYY-MM-DD'))
        .then(() => channel333.send('?classement'));
    },
    start: false,
    timeZone: 'Europe/Paris'
  }));

  cronList_.push(new CronJob({
    cronTime: '00 45 06 * * *',
    onTick: async () => {
      await event333().then(scrambles => sendScrambles(
        bot.channels.get(process.env.CHANNEL_333),
        `Scrambles 3x3x3 (${moment().format('YYYY-MM-DD')}) : `,
        scrambles));
    },
    start: false,
    timeZone: 'Europe/Paris'
  }));

  cronList_.forEach(c => c.start());
  logger.log('info', 'Cron Started');
};

const stopCron = () => {
  cronList_.forEach(c => c.stop());
  logger.log('info', 'Cron Stopped');
};

module.exports = {startCron, stopCron};
