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

const helpCommand = async ({channel}) => R.pipe(
  helpMessage,
  R.then(sendMessageToChannel(channel)))();

const newTimesCommand = x => R.pipe(
  insertNewTimes,
  R.then(sendMessageToChannel(R.prop('channel', x)))
)(x);

const dailyRanksCommand = async ({channel, event, args}) => {
  const date = ensureDay(args[0]);
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableEvents.includes(event.toUpperCase())) ?
    messageSender('Merci de préciser l\'event') :
    R.pipe(
      getDayStandings,
      R.then(R.curry(dailyRankingsFormat)(channel, date)),
      R.then(messageSender)
    )(date, event);
};

const monthlyRanksCommand = async ({
  channel,
  event,
  args: [date = new Date()]
}) => {
  const messageSender = sendMessageToChannel(channel);
  const eventUpper = event.toUpperCase();
  return R.not(availableEvents.includes(eventUpper)) ?
    messageSender('Merci de préciser l\'event') :
    R.pipe(
      getMonthStandings,
      R.then(R.curry(monthlyRankingsFormat)(channel, eventUpper, date)),
      R.then(messageSender)
    )(date, eventUpper);
};

const dididoCommand = async ({date, author, event, channel}) => {
  const messageSender = sendMessageToChannel(channel);
  const eventUpper = event.toUpperCase();
  return R.not(availableEvents.includes(eventUpper)) ?
    messageSender('Merci de préciser l\'event') :
    R.pipe(
      haveTimesForToday,
      R.then(participation => participation ? 'Oui' : 'Non'),
      R.then(messageSender)
    )(date, author.id, eventUpper);
};

const idoCommand = async ({author, event, channel}) => {
  const messageSender = sendMessageToChannel(channel);
  const eventUpper = event.toUpperCase();
  return R.not(availableEvents.includes(eventUpper)) ?
    messageSender('Merci de préciser l\'event') :
    addNotifSquad(author.id, eventUpper)
      .then(messageSender('Vous avez bien été ajouté a la notif squad !'));
};

const idonotdoCommand = async ({author, event, channel}) => {
  const messageSender = sendMessageToChannel(channel);
  const eventUpper = event.toUpperCase();
  return R.not(availableEvents.includes(eventUpper)) ?
    messageSender('Merci de préciser l\'event') :
    deleteNotifSquad(author.id, eventUpper)
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
