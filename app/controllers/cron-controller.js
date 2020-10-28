import Cron from 'cron';
const { CronJob } = Cron;

import dayjs from 'dayjs';
import R from 'ramda';
import { events, hours } from '../config.js';
import {
  monthlyRankingsFormat,
  dailyRankingsFormat,
} from '../helpers/messages-helpers.js';
import logger from '../tools/logger.js';
import {
  updateStandings,
  getMonthStandings,
  getNotifSquad,
} from './cube-db.js';

import { removeRole, addRole } from './role-controller.js';
import { sendScrambles, getScrambles } from './scrambler.js';

const cronList_ = [];

const startCron = (bot) => {
  cronList_.push(
    new CronJob({
      cronTime: '0 59 23 * * *',
      onTick: () => {
        const standingsDate = dayjs().format('YYYY-MM-DD');

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
        const date = dayjs().add(1, 'h').format('YYYY-MM-DD');

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
        const date = dayjs().subtract(1, 'h').format('YYYY-MM');

        const [standings, rankings] = R.ap(
          [getMonthStandings, monthlyRankingsFormat],
          [date]
        );

        const monthStandings = (event) => {
          const chan = bot.channels.cache.get(R.path(['env', event], process));

          R.pipe(
            standings,
            R.andThen(
              R.pipe(
                (ranks) => {
                  addRole(bot, ranks);
                  return rankings(chan, ranks);
                },
                (x) => chan.send(x)
              )
            )
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
        const time = dayjs().hour();

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

export { startCron, stopCron };
