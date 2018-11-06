const fs = require('fs-extra');
const moment = require('moment');
const {CronJob} = require('cron');
const logger = require('../tools/logger');
const {
  monthlyRankingsFormat,
  dailyRankingsFormat
} = require('../helpers/messages-helpers');
const {
  updateStandings,
  getMonthStandings,
  getDayStandings
} = require('./cube-db');
const {
  sendScrambles,
  event333
} = require('./scrambler');

const cronList_ = [];

const startCron = bot => {
  cronList_.push(new CronJob({
    cronTime: '00 59 23 * * *',
    onTick: async () => {
      const channel333 = bot.channels.get(process.env.CHANNEL_333);
      const date = moment().format('YYYY-MM-DD');
      await updateStandings(date, '333')
        .then(() => getDayStandings(date, '333'))
        .then(ranks => channel333.send(
          dailyRankingsFormat(channel333, date, ranks)));
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
      const date = moment().subtract(1, 'months').format('YYYY-MM-DD');
      getMonthStandings(date, '333')
        .then(ranks => {
          channel333.send(
            monthlyRankingsFormat(channel333, '333', date, ranks));
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
