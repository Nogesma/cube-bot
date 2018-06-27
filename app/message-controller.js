const moment = require('moment');
const logger = require('./tools/logger');
const {
  insertNewTimes,
  getTodayStandings
} = require('./database/cube-db');

const incomingMessage = message => {
  if (message.content.indexOf('?') === 0) {
    const [command, ...args] = message.content.split(' ');
    const author = message.author.id;
    const channel = message.channel;

    const date = moment().format('YYYY-MM-DD');

    switch (command) {
      case '?t':
        insertNewTimes(date, author, args)
          .then(msg => {
            channel.send(msg);
            logger.log('info', `${author} submitted times`);
          });
        break;
      case '?classement':
        getTodayStandings(date)
          .then(ranks => {
            channel.send('Classement du jour (en cours) :\n' + ranks.map(
              a => `${channel.client.users.get(a.author).username} : ${a.time}`)
              .join('\n'));
          });
        break;
      default:
        channel.send('Commande non reconnue');
        break;
    }
  }
};

module.exports = {incomingMessage};
