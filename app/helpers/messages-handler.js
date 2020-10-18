import R from 'ramda';
import dayjs from 'dayjs';

import {
  events as availableEvents,
  hours as availableTimes,
} from '../config.js';
import {
  insertNewTimes,
  getDayStandings,
  getMonthStandings,
  haveTimesForToday,
  addNotifSquad,
  deleteNotifSquad,
  getUserPB,
} from '../controllers/cube-db.js';
import {
  helpMessage,
  ensureDate,
  dailyRankingsFormat,
  monthlyRankingsFormat,
  displayPB,
} from './messages-helpers.js';

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
      R.andThen(
        R.pipe(dailyRankingsFormat(formattedDate, channel), messageSender)
      )
    )(formattedDate, event)
  );
};

const monthlyRanksCommand = ({ channel, event, args: [date] }) => {
  const formattedDate = ensureDate(date).format('YYYY-MM');
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, messageSender, () =>
    R.pipe(
      getMonthStandings,
      R.andThen(
        R.pipe(monthlyRankingsFormat(formattedDate, channel), messageSender)
      )
    )(formattedDate, event)
  );
};

const dididoCommand = ({ date, author, event, channel }) => {
  const messageSender = sendMessageToChannel(channel);
  return includesEvent(event, messageSender, () =>
    R.pipe(
      haveTimesForToday,
      R.andThen(
        R.pipe(
          (participation) => (participation ? 'Oui' : 'Non'),
          messageSender
        )
      )
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

  const events = R.includes(event, availableEvents) ? [event] : availableEvents;

  const userName = R.join(' ', args);

  const user =
    channel.members?.find(
      R.either(
        R.pipe(R.prop('nickname'), R.equals(userName)),
        R.pipe(R.path(['user', 'username']), R.equals(userName))
      )
    )?.user ?? author;

  const displayPBforUser = displayPB(user);

  R.pipe(
    (events) =>
      Promise.all(R.map(async (e) => [e, await getUserPB(user, e)], events)),
    R.andThen(displayPBforUser),
    R.andThen(messageSender)
  )(events);
};

const scrCommand = ({ channel, event, args: [n] }) =>
  R.pipe(
    R.ifElse(
      (e, n) => (n ? n <= 5 : 1),
      R.tryCatch(getScrambles, R.always('Event non valide.')),
      R.always('Vous ne pouvez pas demander plus de 5 mélanges.')
    ),
    sendMessageToChannel(channel)
  )(event, n);

export {
  helpCommand,
  newTimesCommand,
  dailyRanksCommand,
  monthlyRanksCommand,
  dididoCommand,
  idoCommand,
  idonotdoCommand,
  pbCommand,
  scrCommand,
};
