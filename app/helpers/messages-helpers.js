const fs = require('fs-extra');
const moment = require('moment-timezone');
const R = require('ramda');
const { computeScore, secondsToTime } = require('../tools/calculators');

const helpMessage = async () =>
  R.join('\n', [
    '```Markdown',
    await fs.readFile('./app/raw-data/help.md', 'utf8'),
    '```',
  ]);

const dailyRankingsFormat = R.curry((date, channel, ranks) =>
  R.join('\n', [
    '```glsl',
    `Classement du ${date} :`,
    ...ranks.map((cuber, idx) => {
      const user = channel.client.users.cache.get(cuber.author);
      const name = user ? user.username : 'RAGE-QUITTER';
      const pts = computeScore(ranks.length, idx);
      return R.join('\n', [
        `#${idx + 1} ${name}: ${cuber.average} ao5, ${
          cuber.single
        } single, ${pts} pts`,
        `[${R.join(', ', cuber.solves)}]`,
      ]);
    }),
    '```',
  ])
);

const displayMonthDate_ = (date) =>
  moment().tz('Europe/Paris').format('YYYY-MM') === date ? 'en cours' : date;

const monthlyRankingsFormat = R.curry((date, channel, ranks) =>
  R.join('\n', [
    '```xl',
    `Classement du mois (${displayMonthDate_(date)}) :`,
    ...ranks.map((cuber, idx) => {
      const user = channel.client.users.cache.get(cuber.author);
      const name = user ? user.username : 'RAGE-QUITTER';
      return `#${idx + 1} ${name} : ${cuber.score} pts (${cuber.attendances})`;
    }),
    '```',
  ])
);

const ensureDate = (date) => {
  const minDate = moment();
  const wantedDate = R.tryCatch(() => moment(date), R.always(undefined))();
  return wantedDate < minDate ? wantedDate : minDate;
};

const displayPB = R.curry((user, pb) =>
  R.join('\n', [
    `__PB de ${user.username}:__`,
    R.pipe(
      R.filter(([_, x]) => x),
      R.map(([e, { single, singleDate, average, averageDate }]) =>
        R.join('\n', [
          `__${e}:__`,
          `PB Single: ${secondsToTime(single)} ${
            singleDate ? `(${moment(singleDate).format('YYYY-MM-DD')})` : ''
          }`,
          `PB Average: ${secondsToTime(average)} ${
            averageDate ? `(${moment(averageDate).format('YYYY-MM-DD')})` : ''
          }`,
        ])
      ),
      R.join('\n')
    )(pb),
  ])
);

module.exports = {
  helpMessage,
  dailyRankingsFormat,
  monthlyRankingsFormat,
  ensureDate,
  displayMonthDate_,
  displayPB,
};
