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
  getNotifSquad,
} = require('./cube-db');
const { removeRole, addRole } = require('./role-controller');
const { sendScrambles, getScrambles } = require('./scrambler');

const cronList_ = [];

const startCron = (bot) => {
  cronList_.push(
    new CronJob({
      cronTime: '0 59 23 * * *',
      onTick: () => {
        const standingsDate = moment().tz('Europe/Paris').format('YYYY-MM-DD');

        R.map(updateStandings(standingsDate), events);
      },
      start: false,
      timeZone: 'Europe/Paris',
    })
  );
  cronList_.push(
    new CronJob({
      cronTime: '0 1 0 * * *',
      onTick: () => {
        const date = moment()
          .tz('Europe/Paris')
          .add(1, 'hours')
          .format('YYYY-MM-DD');

        const send = sendScrambles(date);

        const formatNameForScrambow = R.ifElse(
          R.includes(R.__, ['3BLD', 'OH']),
          R.always('333'),
          R.toLower
        );

        const scrambleSend = (event) => {
          const chan = bot.channels.cache.get(R.path(['env', event], process));

          R.pipe(getScrambles, send(chan))(formatNameForScrambow(event), 5);
          chan.send(dailyRankingsFormat(date, chan, []));
        };

        R.map(scrambleSend, events);
      },
      start: false,
      timeZone: 'Europe/Paris',
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '0 0 0 1 * *',
      onTick: () => {
        removeRole(bot);
      },
      start: false,
      timeZone: 'Europe/Paris',
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '30 0 0 1 * *',
      onTick: () => {
        const date = moment()
          .tz('Europe/Paris')
          .subtract(1, 'hours')
          .format('YYYY-MM');

        const [standings, rankings] = R.ap(
          [getMonthStandings, monthlyRankingsFormat],
          [date]
        );

        const monthStandings = (event) => {
          const chan = bot.channels.cache.get(R.path(['env', event], process));

          R.pipe(
            standings,
            R.andThen((ranks) => {
              addRole(bot, ranks);
              return rankings(chan, ranks);
            }),
            R.andThen((x) => chan.send(x))
          )(event);
        };

        R.map(monthStandings, events);
      },
      start: false,
      timeZone: 'Europe/Paris',
    })
  );

  cronList_.push(
    new CronJob({
      cronTime: '0 0 * * * *',
      onTick: () => {
        const time = moment().tz('Europe/Paris').hour();

        if (R.includes(time, hours)) {
          const chan = bot.channels.cache.get(process.env.CHANNEL_SPAM);
          R.pipe(
            getNotifSquad,
            R.andThen(
              R.unless(R.isEmpty, (doc) =>
                chan.send(
                  `Participez au tournoi ! ${R.join(
                    ' ',
                    R.map((x) => `<@${x}>`, doc)
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

  cronList_.forEach((c) => c.start());
  logger.log('info', 'Cron Started');
};

const stopCron = () => {
  cronList_.forEach((c) => c.stop());
  logger.log('info', 'Cron Stopped');
};

module.exports = { startCron, stopCron };
