const dailyRankingsFormat = (ranks, channel) => [
  '```glsl',
  'Classement du jour :',
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

module.exports = {dailyRankingsFormat, monthlyRankingsFormat};
