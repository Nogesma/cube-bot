const {curry, pipeP, not} = require('ramda');
const {
  insertNewTimes,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday
} = require('../controllers/cube-db');
const {
  helpMessage,
  ensureDay,
  dailyRankingsFormat,
  monthlyRankingsFormat
} = require('./messages-helpers');

const sendMessageToChannel = curry((channel, msg) => channel.send(msg));

const helpCommand = async ({channel}) => pipeP(helpMessage,
  sendMessageToChannel(channel))();

const newTimesCommand = async ({channel, date, author, event, args}) => pipeP(
  insertNewTimes,
  sendMessageToChannel(channel)
)(date, author.id, event, args);

const dailyRanksCommand = async ({channel, event, args}) => {
  const date = ensureDay(args[0]);
  const messageSender = sendMessageToChannel(channel);
  return not(event) ? messageSender('Merci de préciser l\'event') :
    pipeP(
      getDayStandings,
      curry(dailyRankingsFormat)(channel, date),
      messageSender
    )(date, event);
};

const monthlyRanksCommand = async ({
  channel,
  event,
  args: [date = new Date()]
}) => {
  const messageSender = sendMessageToChannel(channel);
  return not(event) ? messageSender('Merci de préciser l\'event') :
    pipeP(
      getMonthStandings,
      curry(monthlyRankingsFormat)(channel, event, date),
      messageSender
    )(date, event);
};

const dididoCommand = async ({date, author, event, channel}) => pipeP(
  haveTimesForToday,
  participation => participation ? 'Oui' : 'Non',
  sendMessageToChannel(channel)
)(date, author.id, event);

module.exports = {
  helpCommand,
  newTimesCommand,
  dailyRanksCommand,
  monthlyRanksCommand,
  dididoCommand
};
