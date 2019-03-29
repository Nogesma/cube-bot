const fs = require('fs-extra');
const moment = require('moment');
const R = require('ramda');
const {computeScore} = require('../tools/calculators');

const helpMessage = async () => [
  '```Markdown',
  await fs.readFile('./app/raw-data/help.md', 'utf8'),
  '```'
];

const dailyRankingsFormat = R.curry((date, channel, ranks) =>
  [
    '```glsl',
    `Classement du ${date} :`,
    ...ranks.map((cuber, idx) => {
      const user = channel.client.users.get(cuber.author);
      const name = user ? user.username : 'RAGE-QUITTER';
      const pts = computeScore(ranks.length, idx);
      return [
        `#${idx + 1} ${name}: ${cuber.time} ao5, ${cuber.best} single, ` +
          `${pts} pts`,
        `[${cuber.solves.join(', ')}]`
      ].join('\n');
    }),
    '```'
  ].join('\n')
);

const getMonthDateFormat_ = R.memoizeWith(R.identity, date =>
  moment(date).format('YYYY-MM')
);

const isCurrentMonth_ = date =>
  getMonthDateFormat_(date) === getMonthDateFormat_();

const displayMonthDate_ = date =>
  isCurrentMonth_(date) ? 'en cours' : getMonthDateFormat_(date);

const monthlyRankingsFormat = R.curry((date, channel, ranks) =>
  [
    '```xl',
    `Classement du mois (${displayMonthDate_(date)}) :`,
    ...ranks.map((cuber, idx) => {
      const user = channel.client.users.get(cuber.author);
      const name = user ? user.username : 'RAGE-QUITTER';
      return `#${idx + 1} ${name} : ${cuber.score} pts (${cuber.attendances})`;
    }),
    '```'
  ].join('\n')
);

const ensureDay = date => {
  const minDate = moment().subtract(1, 'days');
  const wantedDate = moment(date);
  return (wantedDate < minDate ? wantedDate : minDate).format('YYYY-MM-DD');
};

module.exports = {
  helpMessage,
  dailyRankingsFormat,
  monthlyRankingsFormat,
  ensureDay
};
