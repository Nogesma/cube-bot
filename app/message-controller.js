const moment = require('moment');
const logger = require('./tools/logger');
const {insertNewTimes} = require('./database/cube-db');

const incomingMessage = message => {
  if (message.content.indexOf('?') === 0) {
    const [command, ...args] = message.content.split(' ');
    const author = message.author;
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
        getRanks(channel);
        break;
      default:
        channel.send('Commande non reconnue');
        break;
    }
  }
};

module.exports = {incomingMessage};
