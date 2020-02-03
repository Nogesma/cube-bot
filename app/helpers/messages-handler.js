const R = require('ramda');
const { events: availableEvents, hours: availableTimes } = require('../config');
const { getPB } = require('../tools/calculators');
const {
  insertNewTimes,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday,
  addNotifSquad,
  deleteNotifSquad,
  getTimes,
} = require('../controllers/cube-db');
const {
  helpMessage,
  ensureDay,
  dailyRankingsFormat,
  monthlyRankingsFormat,
} = require('./messages-helpers');

const sendMessageToChannel = R.curry((channel, msg) => channel.send(msg));

const includesEvent = (event, messageSender, func) =>
  R.includes(event, availableEvents)
    ? func()
    : messageSender(`Veuillez entrer un event valide : ${availableEvents}`);

const includesTime = (time, messageSender, func) =>
  R.includes(time, availableTimes)
    ? func()
    : messageSender(`Veuillez entrer une heure valide : ${availableTimes}`);

const helpCommand = ({ channel }) =>
  R.pipe(helpMessage, R.then(sendMessageToChannel(channel)))();

const newTimesCommand = (x) =>
  R.pipe(insertNewTimes, R.then(sendMessageToChannel(R.prop('channel', x))))(x);

const dailyRanksCommand = ({ channel, event, args }) => {
  const date = ensureDay(args[0]);
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, messageSender, () =>
    R.pipe(
      getDayStandings,
      R.then(dailyRankingsFormat(date, channel)),
      R.then(messageSender)
    )(date, event)
  );
};

const monthlyRanksCommand = ({ channel, event, args: [date = new Date()] }) => {
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, messageSender, () =>
    R.pipe(
      getMonthStandings,
      R.then(monthlyRankingsFormat(date, channel)),
      R.then(messageSender)
    )(date, event)
  );
};

const dididoCommand = ({ date, author, event, channel }) => {
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, messageSender, () =>
    R.pipe(
      haveTimesForToday,
      R.then((participation) => (participation ? 'Oui' : 'Non')),
      R.then(messageSender)
    )(date.format('YYYY-MM-DD'), R.prop('id', author), event)
  );
};

const idoCommand = ({ author, event, channel }) => {
  const time = Number(event);
  const messageSender = sendMessageToChannel(channel);
  return includesTime(time, messageSender, () =>
    R.pipe(
      addNotifSquad,
      R.then(messageSender('Vous avez bien été ajouté a la notif squad !'))
    )(R.prop('id', author), time)
  );
};

const idonotdoCommand = ({ author, event, channel }) => {
  const time = Number(event);
  const messageSender = sendMessageToChannel(channel);
  return includesTime(time, messageSender, () =>
    R.pipe(
      deleteNotifSquad,
      R.then(messageSender('Vous avez bien été supprimé de la notif squad !'))
    )(R.prop('id', author), time)
  );
};

const pbCommand = ({ author, event, channel }) => {
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, messageSender, () =>
    R.pipe(
      getTimes,
      R.then(getPB),
      R.then(({ single, average }) =>
        messageSender(`PB Single: ${single}\n PB Average: ${average}`)
      )
    )(author, event)
  );
};

module.exports = {
  helpCommand,
  newTimesCommand,
  dailyRanksCommand,
  monthlyRanksCommand,
  dididoCommand,
  idoCommand,
  idonotdoCommand,
  pbCommand,
};
