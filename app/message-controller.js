const moment = require('moment');
const logger = require('./tools/logger');
const {
  insertNewTimes,
  getTodayStandings,
  getMonthStandings,
  haveTimesForToday
} = require('./controllers/cube-db');

const incomingMessage = message => {
  if (message.content.indexOf('?') === 0) {
    const [command, ...args] = message.content.split(' ');
    const {author} = message;
    const {channel} = message;

    const date = moment().format('YYYY-MM-DD');

    switch (command) {
      case '?t':
        insertNewTimes(date, author.id, args)
          .then(msg => {
            channel.send(msg);
            logger.log('info',
              `${author.username} (${author.id}) submitted times`);
          });
        break;
      case '?classement':
        getTodayStandings(date)
          .then(ranks => {
            channel.send([
              '```glsl',
              'Classement du jour :',
              ...ranks.map(
                cuber => `# ${channel.client.users.get(
                  cuber.author).username}: ${cuber.time} ao5
[${cuber.solves.join(', ')}]`),
              '```'
            ].join('\n'));
          });
        break;
      case '?classementmois':
        getMonthStandings(date)
          .then(ranks => {
            channel.send('Classement du mois (en cours) :\n' + ranks.map(
              cuber => {
                const user = channel.client.users.get(cuber.author);
                const name = (user) ? user.username : 'RAGE-QUITTER';
                return [
                  `${name} : `,
                  `${cuber.score} points, `,
                  `${cuber.wins} win(s), `,
                  `${cuber.podiums} podium(s)`
                ].join(' ');
              }).join('\n'));
          });
        break;
      case '?didido333':
        haveTimesForToday(date, author.id)
          .then(hasParticipated =>
            channel.send(hasParticipated ? 'Oui' : 'Non'));
        break;
      case '?h':
      case '?help':
        channel.send([
          '```Markdown',
          '# Envoyer tes temps : ?t <tps1> <tps2> <tps3> <tps4> <tps5>',
          'Exemple : ?t 12.03 55.40 70.30 12.37 15.42',
          'Pensez à mettre vos temps en secondes !',
          '',
          '# Afficher le classement de la journée : ?classement',
          '',
          '# Afficher le classement pour le mois en cours : ?classementmois',
          '',
          '# Afficher votre participation d\'aujourd\'hui : ?didido333',
          '```'
        ].join('\n'));
        break;
      default:
        channel.send('Commande non reconnue');
        break;
    }
  }
};

module.exports = {incomingMessage};
