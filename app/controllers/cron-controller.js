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
  getDayStandings,
  getNotifSquad
} = require('./cube-db');
const {
  sendScrambles,
  event333,
  event222
} = require('./scrambler');

const cronList_ = [];

const startCron = bot => {
  cronList_.push(new CronJob({
    cronTime: '00 59 23 * * *',
    onTick: async () => {
      const channel333 = bot.channels.get(process.env.CHANNEL_333);
      const channel222 = bot.channels.get(process.env.CHANNEL_222);
      const date = moment().format('YYYY-MM-DD');
      await updateStandings(date, '333')
        .then(() => getDayStandings(date, '333'))
        .then(ranks => channel333.send(
          dailyRankingsFormat(channel333, date, ranks)));
      await updateStandings(date, '222')
        .then(() => getDayStandings(date, '222'))
        .then(ranks => channel222.send(
          dailyRankingsFormat(channel222, date, ranks)));
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
      await event222().then(scrambles => sendScrambles(
        bot.channels.get(process.env.CHANNEL_222),
        `Scrambles 2x2x2 (${moment().format('YYYY-MM-DD')}) : `,
        scrambles));
    },
    start: false,
    timeZone: 'Europe/Paris'
  }));

  cronList_.push(new CronJob({
    cronTime: '1 0 0 1 * *',
    onTick: async () => {
      const channel333 = bot.channels.get(process.env.CHANNEL_333);
      const channel222 = bot.channels.get(process.env.CHANNEL_222);
      const date = moment().subtract(1, 'months').format('YYYY-MM-DD');
      getMonthStandings(date, '333')
        .then(ranks => {
          channel333.send(
            monthlyRankingsFormat(channel333, '333', date, ranks));
        });
      getMonthStandings(date, '222')
        .then(ranks => {
          channel222.send(
            monthlyRankingsFormat(channel222, '222', date, ranks));
        });
    },
    start: false,
    timeZone: 'Europe/Paris'
  }));

  cronList_.push(new CronJob({
    cronTime: '00 00 18 * * *',
    onTick: async () => {
      const date = moment().format('YYYY-MM-DD');
      const channelSpam = bot.channels.get(process.env.CHANNEL_SPAM);
      await getNotifSquad('333', date)
        .then(doc =>
          channelSpam.send(
            `Faites votre 333 ! ${doc.map(x => `<@${x}>`).join(' ')}`));
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
