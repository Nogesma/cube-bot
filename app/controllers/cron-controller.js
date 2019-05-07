const {CronJob} = require('cron');
const moment = require('moment');
const R = require('ramda');
const {events, hours} = require('../config');
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
      onTick: () => {
        const date = moment().format('YYYY-MM-DD');

        const update = updateStandings(date);
        const standings = getDayStandings(date);
        const rankings = dailyRankingsFormat(date);

        const dailyRankings = async event => {
          const chan = bot.channels.get(R.path(['env', event], process));

          await update(event);

          R.pipe(
            standings,
            R.then(rankings(chan)),
            R.then(x => chan.send(x))
          )(event);
        };

        R.map(dailyRankings, events);
      },
      start: false,
      timeZone: 'Europe/Paris'
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '1 0 0 1 * *',
      onTick: () => {
        const date = moment()
          .subtract(1, 'months')
          .format('YYYY-MM-DD');

        const rankings = monthlyRankingsFormat(date);
        const standings = getMonthStandings(date);

        const monthStandings = event => {
          const chan = bot.channels.get(R.path(['env', event], process));

          R.pipe(
            standings,
            R.then(ranks => {
              addRole(bot, ranks);
              return rankings(chan, ranks);
            }),
            R.then(x => chan.send(x))
          )(event);
        };

        supRole(bot);

        R.map(monthStandings, events);
      },
      start: false,
      timeZone: 'Europe/Paris'
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '00 01 00 * * *',
      onTick: () => {
        const date = moment().format('YYYY-MM-DD');

        const send = sendScrambles(date);

        const formatNameForScrambow = R.ifElse(
          R.includes(R.__, ['3BLD', 'OH']),
          R.always('333'),
          R.toLower
        );

        const scrambleSend = event => {
          const chan = bot.channels.get(R.path(['env', event], process));

          R.pipe(
            scrambles,
            send(chan)
          )(formatNameForScrambow(event));
        };

        R.map(scrambleSend, events);
      },
      start: false,
      timeZone: 'Europe/Paris'
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '00 00 * * * *',
      onTick: () => {
        const time = moment().hour();
        if (R.includes(time, hours)) {
          const chan = bot.channels.get(process.env.CHANNEL_SPAM);

          R.pipe(
            getNotifSquad,
            R.then(doc =>
              chan.send(
                `Participez au tournoi ! ${R.join(
                  ' ',
                  R.map(x => `<@${x}>`, doc)
                )}`
              )
            )
          )(time);
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
