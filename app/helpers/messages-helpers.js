const moment = require('moment');
const fs = require('fs-extra');
const {memoize} = require('ramda');

const helpMessage = async () => [
  '```Markdown',
  await fs.readFile('./app/raw-data/help.md', 'utf8'),
  '```'
];

const dailyRankingsFormat = (channel, date, ranks) => [
  '```glsl',
  `Classement du ${date} :`,
  ...ranks.map(
    cuber => {
      const user = channel.client.users.get(cuber.author);
      const name = user ? user.username : 'RAGE-QUITTER';
      return [
        `# ${name}: ${cuber.time} ao5`,
        `[${cuber.solves.join(', ')}]`
      ].join('\n');
    }),
  '```'
].join('\n');

const getMonthDateFormat_ = memoize(date => moment(date).format('YYYY-MM'));

const isCurrentMonth_ = date => getMonthDateFormat_(date) ===
  getMonthDateFormat_();

const displayMonthDate_ = date => isCurrentMonth_(date) ? 'en cours' :
  getMonthDateFormat_(date);

const monthlyRankingsFormat = (channel, event, date, ranks) => [
  '```glsl',
  `Classement ${event} du mois (${displayMonthDate_(date)}) :`,
  ...ranks.map(
    cuber => {
      const user = channel.client.users.get(cuber.author);
      const name = (user) ? user.username : 'RAGE-QUITTER';
      return `${name} : ${cuber.score}w pts`; // (${cuber.attendances})`;
    }),
  '```'
].join('\n');

const ensureDay = date => {
  const minDate = moment().subtract(1, 'days');
  const wantedDate = moment(date);
  return ((wantedDate < minDate) ? wantedDate : minDate).format('YYYY-MM-DD');
};

module.exports = {
  helpMessage,
  dailyRankingsFormat,
  monthlyRankingsFormat,
  ensureDay
};
