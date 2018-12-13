const R = require('ramda');
const {
  insertNewTimes,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday,
  addNotifSquad,
  deleteNotifSquad
} = require('../controllers/cube-db');
const {events: availableEvents} = require('../config.js');
const {
  helpMessage,
  ensureDay,
  dailyRankingsFormat,
  monthlyRankingsFormat
} = require('./messages-helpers');

const sendMessageToChannel = R.curry((channel, msg) => channel.send(msg));

const helpCommand = async ({channel}) => R.pipeP(helpMessage,
  sendMessageToChannel(channel))();

const newTimesCommand = x => R.pipe(
  insertNewTimes,
  R.then(sendMessageToChannel(R.prop('channel', x)))
)(x);

const dailyRanksCommand = async ({channel, event, args}) => {
  const date = ensureDay(args[0]);
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableEvents.includes(event)) ?
    messageSender('Merci de préciser l\'event') :
    R.pipeP(
      getDayStandings,
      R.curry(dailyRankingsFormat)(channel, date),
      messageSender
    )(date, event);
};

const monthlyRanksCommand = async ({
  channel,
  event,
  args: [date = new Date()]
}) => {
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableEvents.includes(event)) ?
    messageSender('Merci de préciser l\'event') :
    R.pipeP(
      getMonthStandings,
      R.curry(monthlyRankingsFormat)(channel, event, date),
      messageSender
    )(date, event);
};

const dididoCommand = async ({date, author, event, channel}) => {
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableEvents.includes(event)) ?
    messageSender('Merci de préciser l\'event') :
    R.pipeP(
      haveTimesForToday,
      participation => participation ? 'Oui' : 'Non',
      messageSender
    )(date, author.id, event);
};

const idoCommand = async ({author, event, channel}) => {
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableEvents.includes(event)) ?
    messageSender('Merci de préciser l\'event') :
    addNotifSquad(author.id, event)
      .then(messageSender('Vous avez bien été ajouté a la notif squad !'));
};

const idonotdoCommand = async ({author, event, channel}) => {
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableEvents.includes(event)) ?
    messageSender('Merci de préciser l\'event') :
    deleteNotifSquad(author.id, event)
      .then(messageSender('Vous avez bien été supprimé de la notif squad !'));
};

module.exports = {
  helpCommand,
  newTimesCommand,
  dailyRanksCommand,
  monthlyRanksCommand,
  dididoCommand,
  idoCommand,
  idonotdoCommand
};
