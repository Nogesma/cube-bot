const {CronJob} = require('cron');
const moment = require('moment');
const R = require('ramda');
const {hours} = require('../config');
const {
  monthlyRankingsFormat,
  dailyRankingsFormat
} = require('../helpers/messages-helpers');
const logger = require('../tools/logger');
const {
  updateStandings,
  getMonthStandings,
  getDayStandings,
  getNotifSquad
} = require('./cube-db');
const {supRole, addRole} = require('./role-controller');
const {sendScrambles, scrambles} = require('./scrambler');

const cronList_ = [];

const startCron = bot => {
  cronList_.push(
    new CronJob({
      cronTime: '00 59 23 * * *',
      onTick: async () => {
        const channel333 = bot.channels.get(process.env.CHANNEL_333);
        const channel222 = bot.channels.get(process.env.CHANNEL_222);
        const channel3BLD = bot.channels.get(process.env.CHANNEL_3BLD);
        const channelOH = bot.channels.get(process.env.CHANNEL_OH);
        const channelSQ1 = bot.channels.get(process.env.CHANNEL_SQ1);
        const date = moment().format('YYYY-MM-DD');
        await updateStandings(date, '333')
          .then(() => getDayStandings(date, '333'))
          .then(ranks =>
            channel333.send(dailyRankingsFormat(channel333, date, ranks))
          );
        await updateStandings(date, '222')
          .then(() => getDayStandings(date, '222'))
          .then(ranks =>
            channel222.send(dailyRankingsFormat(channel222, date, ranks))
          );
        await updateStandings(date, '3BLD')
          .then(() => getDayStandings(date, '3BLD'))
          .then(ranks =>
            channel3BLD.send(dailyRankingsFormat(channel3BLD, date, ranks))
          );
        await updateStandings(date, 'OH')
          .then(() => getDayStandings(date, 'OH'))
          .then(ranks =>
            channelOH.send(dailyRankingsFormat(channelOH, date, ranks))
          );
        await updateStandings(date, 'SQ1')
          .then(() => getDayStandings(date, 'SQ1'))
          .then(ranks =>
            channelSQ1.send(dailyRankingsFormat(channelSQ1, date, ranks))
          );
      },
      start: false,
      timeZone: 'Europe/Paris'
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '1 0 0 1 * *',
      onTick: async () => {
        const channel333 = bot.channels.get(process.env.CHANNEL_333);
        const channel222 = bot.channels.get(process.env.CHANNEL_222);
        const channel3BLD = bot.channels.get(process.env.CHANNEL_3BLD);
        const channelOH = bot.channels.get(process.env.CHANNEL_OH);
        const channelSQ1 = bot.channels.get(process.env.CHANNEL_SQ1);
        const date = moment()
          .subtract(1, 'months')
          .format('YYYY-MM-DD');
        supRole(bot);
        getMonthStandings(date, '333').then(ranks => {
          addRole(bot, ranks);
          channel333.send(
            monthlyRankingsFormat(channel333, '3x3x3', date, ranks)
          );
        });
        getMonthStandings(date, '222').then(ranks => {
          addRole(bot, ranks);
          channel222.send(
            monthlyRankingsFormat(channel222, '2x2x2', date, ranks)
          );
        });
        getMonthStandings(date, '3BLD').then(ranks => {
          addRole(bot, ranks);
          channel3BLD.send(
            monthlyRankingsFormat(channel3BLD, '3BLD', date, ranks)
          );
        });
        getMonthStandings(date, 'OH').then(ranks => {
          addRole(bot, ranks);
          channelOH.send(monthlyRankingsFormat(channelOH, 'OH', date, ranks));
        });
        getMonthStandings(date, 'SQ1').then(ranks => {
          addRole(bot, ranks);
          channelSQ1.send(
            monthlyRankingsFormat(channelSQ1, 'Square-1', date, ranks)
          );
        });
      },
      start: false,
      timeZone: 'Europe/Paris'
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '00 01 00 * * *',
      onTick: async () => {
        const date = moment().format('YYYY-MM-DD');
        await scrambles('333').then(scramblesList =>
          sendScrambles(
            bot.channels.get(process.env.CHANNEL_333),
            '3x3x3',
            date,
            scramblesList
          )
        );
        await scrambles('222').then(scramblesList =>
          sendScrambles(
            bot.channels.get(process.env.CHANNEL_222),
            '2x2x2',
            date,
            scramblesList
          )
        );
        await scrambles('333').then(scramblesList =>
          sendScrambles(
            bot.channels.get(process.env.CHANNEL_3BLD),
            '3BLD',
            date,
            scramblesList
          )
        );
        await scrambles('333').then(scramblesList =>
          sendScrambles(bot.channels.get(process.env.CHANNEL_OH), 'OH', date, scramblesList)
        );
        await scrambles('sq1').then(scramblesList =>
          sendScrambles(
            bot.channels.get(process.env.CHANNEL_SQ1),
            'Square-1',
            date,
            scramblesList
          )
        );
      },
      start: false,
      timeZone: 'Europe/Paris'
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '00 00 * * * *',
      onTick: async () => {
        const time = moment().hour();
        if (R.includes(time, hours)) {
          const channelSpam = bot.channels.get(process.env.CHANNEL_SPAM);
          await getNotifSquad(time).then(doc =>
            channelSpam.send(
              `Participez au tournoi ! ${doc.map(x => `<@${x}>`).join(' ')}`
            )
          );
        }
      },
      start: false,
      timeZone: 'Europe/Paris'
    })
  );

  cronList_.forEach(c => c.start());
  logger.log('info', 'Cron Started');
};

const stopCron = () => {
  cronList_.forEach(c => c.stop());
  logger.log('info', 'Cron Stopped');
};

module.exports = {startCron, stopCron};
