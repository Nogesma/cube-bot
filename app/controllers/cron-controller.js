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
  event222,
  event444,
  eventMega
} = require('./scrambler');

const cronList_ = [];

const startCron = bot => {
  cronList_.push(new CronJob({
    cronTime: '00 59 23 * * *',
    onTick: async () => {
      const channel333 = bot.channels.get(process.env.CHANNEL_333);
      const channel222 = bot.channels.get(process.env.CHANNEL_222);
      const channel444 = bot.channels.get(process.env.CHANNEL_444);
      const channel3BLD = bot.channels.get(process.env.CHANNEL_3BLD);
      const channelOH = bot.channels.get(process.env.CHANNEL_OH);
      const channelMEGA = bot.channels.get(process.env.CHANNEL_MEGA);
      const date = moment().format('YYYY-MM-DD');
      const niceDate = moment().format('DD-MM-YY');
      await updateStandings(date, '333')
        .then(() => getDayStandings(date, '333'))
        .then(ranks => channel333.send(
          dailyRankingsFormat(channel333, niceDate, ranks)));
      await updateStandings(date, '222')
        .then(() => getDayStandings(date, '222'))
        .then(ranks => channel222.send(
          dailyRankingsFormat(channel222, niceDate, ranks)));
      await updateStandings(date, '444')
        .then(() => getDayStandings(date, '444'))
        .then(ranks => channel444.send(
          dailyRankingsFormat(channel444, niceDate, ranks)));
      await updateStandings(date, '3BLD')
        .then(() => getDayStandings(date, '3BLD'))
        .then(ranks => channel3BLD.send(
          dailyRankingsFormat(channel3BLD, niceDate, ranks)));
      await updateStandings(date, 'OH')
        .then(() => getDayStandings(date, 'OH'))
        .then(ranks => channelOH.send(
          dailyRankingsFormat(channelOH, niceDate, ranks)));
      await updateStandings(date, 'MEGA')
        .then(() => getDayStandings(date, 'MEGA'))
        .then(ranks => channelMEGA.send(
          dailyRankingsFormat(channelMEGA, niceDate, ranks)));
    },
    start: false,
    timeZone: 'Europe/Paris'
  }));

  cronList_.push(new CronJob({
    cronTime: '1 0 0 1 * *',
    onTick: async () => {
      const channel333 = bot.channels.get(process.env.CHANNEL_333);
      const channel222 = bot.channels.get(process.env.CHANNEL_222);
      const channel444 = bot.channels.get(process.env.CHANNEL_444);
      const channel3BLD = bot.channels.get(process.env.CHANNEL_3BLD);
      const channelOH = bot.channels.get(process.env.CHANNEL_OH);
      const channelMEGA = bot.channels.get(process.env.CHANNEL_MEGA);
      const date = moment().subtract(1, 'months').format('YYYY-MM-DD');
      getMonthStandings(date, '333')
        .then(ranks => {
          channel333.send(
            monthlyRankingsFormat(channel333, '3x3x3', date, ranks));
        });
      getMonthStandings(date, '222')
        .then(ranks => {
          channel222.send(
            monthlyRankingsFormat(channel222, '2x2x2', date, ranks));
        });
      getMonthStandings(date, '444')
        .then(ranks => {
          channel444.send(
            monthlyRankingsFormat(channel444, '4x4x4', date, ranks));
        });
      getMonthStandings(date, '3BLD')
        .then(ranks => {
          channel3BLD.send(
            monthlyRankingsFormat(channel3BLD, '3BLD', date, ranks));
        });
      getMonthStandings(date, 'OH')
        .then(ranks => {
          channelOH.send(
            monthlyRankingsFormat(channelOH, 'OH', date, ranks));
        });
      getMonthStandings(date, 'MEGA')
        .then(ranks => {
          channelMEGA.send(
            monthlyRankingsFormat(channelMEGA, 'Megaminx', date, ranks));
        });
    },
    start: false,
    timeZone: 'Europe/Paris'
  }));

  cronList_.push(new CronJob({
    cronTime: '00 01 00 * * *',
    onTick: async () => {
      const date = moment().format('DD-MM-YY');
      await event333().then(scrambles => sendScrambles(
        bot.channels.get(process.env.CHANNEL_333),
        '3x3x3', date, scrambles));
      await event222().then(scrambles => sendScrambles(
        bot.channels.get(process.env.CHANNEL_222),
        '2x2x2', date, scrambles));
      await event444().then(scrambles => sendScrambles(
        bot.channels.get(process.env.CHANNEL_444),
        '4x4x4', date, scrambles));
      await event333().then(scrambles => sendScrambles(
        bot.channels.get(process.env.CHANNEL_3BLD),
        '3BLD', date, scrambles));
      await event333().then(scrambles => sendScrambles(
        bot.channels.get(process.env.CHANNEL_OH),
        'OH', date, scrambles));
      await eventMega().then(scrambles => sendScrambles(
        bot.channels.get(process.env.CHANNEL_MEGA),
        'Megaminx', date, scrambles));
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
            `Faites votre 3x3x3 ! ${doc.map(x => `<@${x}>`).join(' ')}`));
      await getNotifSquad('222', date)
        .then(doc =>
          channelSpam.send(
            `Faites votre 2x2x2 ! ${doc.map(x => `<@${x}>`).join(' ')}`));
      await getNotifSquad('444', date)
        .then(doc =>
          channelSpam.send(
            `Faites votre 4x4x4 ! ${doc.map(x => `<@${x}>`).join(' ')}`));
      await getNotifSquad('3BLD', date)
        .then(doc =>
          channelSpam.send(
            `Faites votre 3BLD ! ${doc.map(x => `<@${x}>`).join(' ')}`));
      await getNotifSquad('OH', date)
        .then(doc =>
          channelSpam.send(
            `Faites votre 3x3x3 OH ! ${doc.map(x => `<@${x}>`).join(' ')}`));
      await getNotifSquad('MEGA', date)
        .then(doc =>
          channelSpam.send(
            `Faites votre Megaminx ! ${doc.map(x => `<@${x}>`).join(' ')}`));
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
