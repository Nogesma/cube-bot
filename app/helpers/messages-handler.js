const R = require('ramda');
const moment = require('moment-timezone');
const { events: availableEvents, hours: availableTimes } = require('../config');
const {
  insertNewTimes,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday,
  addNotifSquad,
  deleteNotifSquad,
  getUserPB,
} = require('../controllers/cube-db');
const {
  helpMessage,
  ensureDate,
  dailyRankingsFormat,
  monthlyRankingsFormat,
} = require('./messages-helpers');
const { secondsToTime } = require('../tools/calculators');

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
  R.pipe(helpMessage, R.andThen(sendMessageToChannel(channel)))();

const newTimesCommand = (x) =>
  R.pipe(
    insertNewTimes,
    R.andThen(sendMessageToChannel(R.prop('channel', x)))
  )(x);

const dailyRanksCommand = ({ channel, event, args: [date] }) => {
  const formattedDate = ensureDate(date).format('YYYY-MM-DD');
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, messageSender, () =>
    R.pipe(
      getDayStandings,
      R.andThen(dailyRankingsFormat(formattedDate, channel)),
      R.andThen(messageSender)
    )(formattedDate, event)
  );
};

const monthlyRanksCommand = ({ channel, event, args: [date] }) => {
  const formattedDate = ensureDate(date).format('YYYY-MM');
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, messageSender, () =>
    R.pipe(
      getMonthStandings,
      R.andThen(monthlyRankingsFormat(formattedDate, channel)),
      R.andThen(messageSender)
    )(formattedDate, event)
  );
};

const dididoCommand = ({ date, author, event, channel }) => {
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, messageSender, () =>
    R.pipe(
      haveTimesForToday,
      R.andThen((participation) => (participation ? 'Oui' : 'Non')),
      R.andThen(messageSender)
    )(date.format('YYYY-MM-DD'), R.prop('id', author), event)
  );
};

const idoCommand = ({ author, event, channel }) => {
  const time = Number(event);
  const messageSender = sendMessageToChannel(channel);
  return includesTime(time, messageSender, () =>
    R.pipe(
      addNotifSquad,
      R.andThen(messageSender('Vous avez bien été ajouté a la notif squad !'))
    )(R.prop('id', author), time)
  );
};

const idonotdoCommand = ({ author, event, channel }) => {
  const time = Number(event);
  const messageSender = sendMessageToChannel(channel);
  return includesTime(time, messageSender, () =>
    R.pipe(
      deleteNotifSquad,
      R.andThen(
        messageSender('Vous avez bien été supprimé de la notif squad !')
      )
    )(R.prop('id', author), time)
  );
};

const pbCommand = ({ author, event, channel, args }) => {
  const messageSender = sendMessageToChannel(channel);
  const userName = R.join(' ', args);
  const isUser = channel.members.find((u) => u.nickname === userName);
  const user = isUser ? isUser.user : author;
  return includesEvent(event, messageSender, () =>
    R.pipe(
      getUserPB,
      R.andThen(({ single, singleDate, average, averageDate }) =>
        messageSender(
          `__PB de ${isUser.nickname}:__\nPB Single: ${secondsToTime(single)} ${
            singleDate ? `(${moment(singleDate).format('YYYY-MM-DD')})` : ''
          }\nPB Average: ${secondsToTime(average)} ${
            averageDate ? `(${moment(averageDate).format('YYYY-MM-DD')})` : ''
          }`
        )
      )
    )(user, event)
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
