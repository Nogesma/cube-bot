const fs = require('fs-extra');
const moment = require('moment');
const {CronJob} = require('cron');
const logger = require('./tools/logger');
const {
  updateStandings,
  getMonthStandings,
  getTodayStandings
} = require('./controllers/cube-db');
const {
  monthlyRankingsFormat,
  dailyRankingsFormat
} = require('./helpers/messages-helpers');
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
    cronTime: '00 59 23 * * *',
    onTick: async () => {
      const channel333 = bot.channels.get(process.env.CHANNEL_333);
      await updateStandings(moment().format('YYYY-MM-DD'), '333')
        .then(() => getTodayStandings(moment().format('YYYY-MM-DD'), '333'))
        .then(ranks => channel333.send(dailyRankingsFormat(ranks, channel333)));
    },
    start: false,
    timeZone: 'Europe/Paris'
  }));

  cronList_.push(new CronJob({
    cronTime: '00 01 00 * * *',
    onTick: async () => {
      await event333().then(scrambles => sendScrambles(
        bot.channels.get(process.env.CHANNEL_333),
        `Scrambles 3x3x3 (${moment().format('YYYY-MM-DD')}) : `,
        scrambles));
    },
    start: false,
    timeZone: 'Europe/Paris'
  }));

  cronList_.push(new CronJob({
    cronTime: '1 0 0 1 * *',
    onTick: async () => {
      const channel333 = bot.channels.get(process.env.CHANNEL_333);
      const date = moment().subtract(1, 'days').format('YYYY-MM-DD');
      getMonthStandings(date)
        .then(ranks => {
          channel333.send(monthlyRankingsFormat(ranks, channel333));
        });
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
