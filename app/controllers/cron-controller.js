const { CronJob } = require('cron');
const moment = require('moment-timezone');
const R = require('ramda');
const { events, hours } = require('../config');
const {
  monthlyRankingsFormat,
  dailyRankingsFormat,
} = require('../helpers/messages-helpers');
const logger = require('../tools/logger');
const {
  updateStandings,
  getMonthStandings,
  getDayStandings,
  getNotifSquad,
} = require('./cube-db');
const { removeRole, addRole } = require('./role-controller');
const { sendScrambles, scrambles } = require('./scrambler');

const cronList_ = [];

const startCron = bot => {
  cronList_.push(
    new CronJob({
      cronTime: '00 59 23 * * *',
      onTick: () => {
        const date = moment()
          .tz('Europe/Paris')
          .format('YYYY-MM-DD');

        const [update, standings, rankings] = R.map(R.flip(R.apply)([date]), [
          updateStandings,
          getDayStandings,
          dailyRankingsFormat,
        ]);

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
      timeZone: 'Europe/Paris',
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '1 0 0 1 * *',
      onTick: () => {
        const date = moment()
          .tz('Europe/Paris')
          .subtract(1, 'months')
          .format('YYYY-MM-DD');

        const [standings, rankings] = R.map(R.flip(R.apply)([date]), [
          getMonthStandings,
          monthlyRankingsFormat,
        ]);

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

        removeRole(bot);

        R.map(monthStandings, events);
      },
      start: false,
      timeZone: 'Europe/Paris',
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '00 01 00 * * *',
      onTick: () => {
        const date = moment()
          .tz('Europe/Paris')
          .format('YYYY-MM-DD');

        const send = sendScrambles(date);

        const formatNameForScrambow = R.ifElse(
          R.includes(R.__, ['3BLD', 'OH']),
          R.always('333'),
          R.toLower
        );

        const scrambleSend = event => {
          const chan = bot.channels.get(R.path(['env', event], process));

          R.pipe(scrambles, send(chan))(formatNameForScrambow(event));
        };

        R.map(scrambleSend, events);
      },
      start: false,
      timeZone: 'Europe/Paris',
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '0 0 * * * *',
      onTick: () => {
        const time = moment()
          .tz('Europe/Paris')
          .hour();

        if (R.includes(time, hours)) {
          const chan = bot.channels.get(process.env.CHANNEL_SPAM);
          R.pipe(
            getNotifSquad,
            R.then(
              R.unless(R.isEmpty, doc =>
                chan.send(
                  `Participez au tournoi ! ${R.join(
                    ' ',
                    R.map(x => `<@${x}>`, doc)
                  )}`
                )
              )
            )
          )(time);
        }
      },
      start: false,
      timeZone: 'Europe/Paris',
    })
  );

  cronList_.forEach(c => c.start());
  logger.log('info', 'Cron Started');
};

const stopCron = () => {
  cronList_.forEach(c => c.stop());
  logger.log('info', 'Cron Stopped');
};

module.exports = { startCron, stopCron };
