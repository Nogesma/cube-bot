const moment = require('moment');
const fs = require('fs-extra');

const helpMessage = async () => [
  '```Markdown',
  await fs.readFile('./app/raw-data/help.md', 'utf8'),
  '```'
];

const dailyRankingsFormat = (ranks, date, channel) => [
  '```glsl',
  `Classement du ${date} :`,
  ...ranks.map(
    cuber => {
      const user = channel.client.users.get(cuber.author);
      const name = (user) ? user.username : 'RAGE-QUITTER';
      return [
        `# ${name}: ${cuber.time} ao5`,
        `[${cuber.solves.join(', ')}]`
      ].join('\n');
    }),
  '```'
].join('\n');

const monthlyRankingsFormat = (ranks, channel) => {
  return 'Classement du mois (en cours) :\n' + ranks.map(
    cuber => {
      const user = channel.client.users.get(cuber.author);
      const name = (user) ? user.username : 'RAGE-QUITTER';
      return [
        `${name} : `,
        `${cuber.score} points, `,
        `${cuber.wins} win(s), `,
        `${cuber.podiums} podium(s)`
      ].join(' ');
    }).join('\n');
};

const getDate = date => {
  const minDate = moment().subtract(1, 'days');
  const wantedDate = moment(date);
  return ((wantedDate < minDate) ? wantedDate : minDate).format('YYYY-MM-DD');
};

module.exports = {
  helpMessage,
  dailyRankingsFormat,
  monthlyRankingsFormat,
  ensureDate: getDate
};
