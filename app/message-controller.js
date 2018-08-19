const moment = require('moment');
const logger = require('./tools/logger');
const {
  insertNewTimes,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday
} = require('./controllers/cube-db');
const {
  helpMessage,
  dailyRankingsFormat,
  monthlyRankingsFormat,
  ensureDate
} = require('./helpers/messages-helpers');

const incomingMessage = message => {
  if (message.content.indexOf('?') === 0) {
    const [command, event, ...args] = message.content.split(' ');
    const {author} = message;
    const {channel} = message;

    const date = moment().format('YYYY-MM-DD');

    switch (command) {
      case '?':
        break;
      case '?t':
        insertNewTimes(date, author.id, event, args)
          .then(msg => {
            channel.send(msg);
            logger.log('info',
              `${author.username} (${author.id}) submitted times`);
          });
        break;
      case '?classement':
        if (!event) {
          channel.send('Merci de préciser l\'event');
          return;
        }
        getDayStandings(ensureDate(args[0]), event).then(
          ranks => channel.send(
            dailyRankingsFormat(ranks, ensureDate(args[0]), channel)));
        break;
      case '?classementmois':
        getMonthStandings(date)
          .then(ranks => {
            channel.send(monthlyRankingsFormat(ranks, channel));
          });
        break;
      case '?didido':
        haveTimesForToday(date, author.id, event)
          .then(hasParticipated =>
            channel.send(hasParticipated ? 'Oui' : 'Non'));
        break;
      case '?h':
      case '?help':
        helpMessage().then(help => channel.send(help));
        break;
      default:
        channel.send('Commande non reconnue');
        break;
    }
  }
};

module.exports = {incomingMessage};
