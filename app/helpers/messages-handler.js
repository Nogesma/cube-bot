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

const includesEvent = (event, channel, func) =>
  R.includes(event, availableEvents)
    ? func(event)
    : sendMessageToChannel(
        channel,
        `Veuillez entrer un event valide : ${availableEvents}`
      );

const includesTime = (time, channel, func) =>
  R.includes(time, availableTimes)
    ? func()
    : sendMessageToChannel(
        channel,
        `Veuillez entrer une heure valide : ${availableTimes}`
      );

const helpCommand = ({channel}) =>
  R.pipe(
    helpMessage,
    R.then(sendMessageToChannel(channel))
  )();

const newTimesCommand = x =>
  R.pipe(
    insertNewTimes,
    R.then(sendMessageToChannel(R.prop('channel', x)))
  )(x);

const dailyRanksCommand = ({channel, event, args}) => {
  const date = ensureDay(args[0]);
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, channel, e =>
    R.pipe(
      getDayStandings,
      R.then(dailyRankingsFormat(date, channel)),
      R.then(messageSender)
    )(date, e)
  );
};

const monthlyRanksCommand = ({channel, event, args: [date = new Date()]}) => {
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, channel, e =>
    R.pipe(
      getMonthStandings,
      R.then(monthlyRankingsFormat(date, channel)),
      R.then(messageSender)
    )(date, e)
  );
};

const dididoCommand = ({date, author, event, channel}) => {
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, channel, e =>
    R.pipe(
      haveTimesForToday,
      R.then(participation => (participation ? 'Oui' : 'Non')),
      R.then(messageSender)
    )(date.format('YYYY-MM-DD'), author.id, e)
  );
};

const idoCommand = ({author, event, channel}) => {
  const time = Number(event);
  const messageSender = sendMessageToChannel(channel);
  return includesTime(time, channel, () =>
    R.pipe(
      addNotifSquad,
      R.then(messageSender('Vous avez bien été ajouté a la notif squad !'))
    )(author.id, time)
  );
};

const idonotdoCommand = ({author, event, channel}) => {
  const time = Number(event);
  const messageSender = sendMessageToChannel(channel);
  return includesTime(time, channel, () =>
    R.pipe(
      deleteNotifSquad,
      R.then(messageSender('Vous avez bien été supprimé de la notif squad !'))
    )(author.id, time)
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
