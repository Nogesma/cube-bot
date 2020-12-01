import R from 'ramda';

import { events as availableEvents } from '../config.js';
import { formatScrambles, genScrambles } from '../controllers/scrambler.js';
import {
  getDayStandings,
  getMonthStandings,
  addNotifSquad,
  deleteNotifSquad,
  getUserById,
} from '../controllers/cube-db.js';
import {
  helpMessage,
  getEvent,
  getDate,
  dailyRankingsFormat,
  monthlyRankingsFormat,
  displayPB,
  getTime,
} from './messages-helpers.js';
import { insertNewTimes } from './global-helpers.js';
import { timeToSeconds } from '../tools/calculators.js';

const sendMessageToChannel = (channel) =>
  R.pipe((x) => channel.send(x), R.always(undefined));

const helpCommand = (x) =>
  R.pipe(
    R.prop('channel'),
    helpMessage,
    R.andThen(sendMessageToChannel(x.channel))
  )(x);

const newTimesCommand = ({ channel, author, args }) => {
  const messageSender = sendMessageToChannel(channel);
  const event = getEvent(args, messageSender);
  const solves = R.map(timeToSeconds, R.tail(args));

  if (event)
    R.pipe(insertNewTimes, R.andThen(messageSender))(
      R.prop('id')(author),
      event,
      solves,
      channel.client.channels
    );
};

const dailyRanksCommand = ({ channel, args }) => {
  const messageSender = sendMessageToChannel(channel);

  const event = getEvent(args, messageSender);
  const date = getDate(
    args,
    event ? messageSender : R.always(undefined)
  )?.format('YYYY-MM-DD');

  if (R.and(date)(event))
    R.pipe(
      getDayStandings,
      R.andThen(R.pipe(dailyRankingsFormat(date)(channel), messageSender))
    )(date, event);
};

const monthlyRanksCommand = ({ channel, args }) => {
  const messageSender = sendMessageToChannel(channel);

  const event = getEvent(args, messageSender);
  const date = getDate(
    args,
    event ? messageSender : R.always(undefined)
  )?.format('YYYY-MM');

  if (R.and(date)(event))
    R.pipe(
      getMonthStandings,
      R.andThen(R.pipe(monthlyRankingsFormat(date)(channel), messageSender))
    )(date, event);
};

const idoCommand = ({ author, channel, args }) => {
  const messageSender = sendMessageToChannel(channel);
  const time = getTime(args, messageSender);
  if (time)
    R.pipe(
      addNotifSquad,
      R.andThen(messageSender('Vous avez bien été ajouté a la notif squad !'))
    )(R.prop('id')(author), time);
};

const idonotdoCommand = ({ author, channel, args }) => {
  const messageSender = sendMessageToChannel(channel);
  const time = getTime(args, messageSender);
  if (time)
    R.pipe(
      deleteNotifSquad,
      R.andThen(
        messageSender('Vous avez bien été supprimé de la notif squad !')
      )
    )(R.prop('id', author), time);
};

const pbCommand = ({ author, channel, args }) => {
  const messageSender = sendMessageToChannel(channel);

  const event = getEvent(args, R.F);

  const userName = R.join(' ', event ? R.tail(args) : args);
  const user =
    channel.members?.find(
      R.either(R.pipe(R.prop('nickname'), R.equals(userName)))(
        R.pipe(R.path(['user', 'username']), R.equals(userName))
      )
    )?.user ?? author;

  const displayPBforUser = displayPB(user);

  R.pipe(
    async (events) =>
      R.filter(
        R.propSatisfies(R.includes(R.__, events), 'event'),
        (await getUserById(user.id))?.pb ?? []
      ),
    R.andThen(displayPBforUser),
    R.andThen(messageSender)
  )(event ? [event] : availableEvents);
};

const scrCommand = ({ channel, args }) => {
  const messageSender = sendMessageToChannel(channel);
  const event = getEvent(args, messageSender);
  const n = Number(args[1]);
  const numberOfAlgs = R.both(R.gt(6), R.lt(0))(n) ? n : 1;

  if (event) messageSender(formatScrambles(genScrambles(event, numberOfAlgs)));
};

export {
  helpCommand,
  newTimesCommand,
  dailyRanksCommand,
  monthlyRanksCommand,
  idoCommand,
  idonotdoCommand,
  pbCommand,
  scrCommand,
};
