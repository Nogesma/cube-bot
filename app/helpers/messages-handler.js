const R = require('ramda');
const {events: availableEvents, hours: availableTimes} = require('../config');
const {
  insertNewTimes,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday,
  addNotifSquad,
  deleteNotifSquad
} = require('../controllers/cube-db');
const {
  helpMessage,
  ensureDay,
  dailyRankingsFormat,
  monthlyRankingsFormat
} = require('./messages-helpers');

const sendMessageToChannel = R.curry((channel, msg) => channel.send(msg));

const helpCommand = async ({channel}) =>
  R.pipe(
    helpMessage,
    R.then(sendMessageToChannel(channel))
  )();

const newTimesCommand = x =>
  R.pipe(
    insertNewTimes,
    R.then(sendMessageToChannel(R.prop('channel', x)))
  )(x);

const dailyRanksCommand = async ({channel, event, args}) => {
  const date = ensureDay(args[0]);
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableEvents.includes(event))
    ? messageSender(`Veuillez entrer un event valide : ${availableEvents}`)
    : R.pipe(
        getDayStandings,
        R.then(dailyRankingsFormat(date, channel)),
        R.then(messageSender)
      )(date, event);
};

const monthlyRanksCommand = async ({
  channel,
  event,
  args: [date = new Date()]
}) => {
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableEvents.includes(event))
    ? messageSender(`Veuillez entrer un event valide : ${availableEvents}`)
    : R.pipe(
        getMonthStandings,
        R.then(monthlyRankingsFormat(date, channel)),
        R.then(messageSender)
      )(date, event);
};

const dididoCommand = async ({date, author, event, channel}) => {
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableEvents.includes(event))
    ? messageSender(`Veuillez entrer un event valide : ${availableEvents}`)
    : R.pipe(
        haveTimesForToday,
        R.then(participation => (participation ? 'Oui' : 'Non')),
        R.then(messageSender)
      )(date.format('YYYY-MM-DD'), author.id, event);
};

const idoCommand = async ({author, event, channel}) => {
  const time = Number(event);
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableTimes.includes(time))
    ? messageSender(`Veuillez entrer une heure valide : ${availableTimes}`)
    : addNotifSquad(author.id, time).then(
        messageSender('Vous avez bien été ajouté a la notif squad !')
      );
};

const idonotdoCommand = async ({author, event, channel}) => {
  const time = Number(event);
  const messageSender = sendMessageToChannel(channel);
  return R.not(availableTimes.includes(time))
    ? messageSender(`Veuillez entrer une heure valide : ${availableTimes}`)
    : deleteNotifSquad(author.id, time).then(
        messageSender('Vous avez bien été supprimé de la notif squad !')
      );
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
