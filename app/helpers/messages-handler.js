import {
  __,
  always,
  and,
  andThen,
  both,
  either,
  equals,
  F,
  filter,
  gt,
  includes,
  join,
  lt,
  map,
  path,
  pipe,
  prop,
  propSatisfies,
  tail,
} from "ramda";

import { events as availableEvents } from "../config.js";
import { formatScrambles, genScrambles } from "../controllers/scrambler.js";
import {
  addNotifSquad,
  deleteNotifSquad,
  getDayStandings,
  getMonthStandings,
  getUserById,
} from "../controllers/cube-db.js";
import {
  dailyRankingsFormat,
  displayPB,
  getDate,
  getEvent,
  getTime,
  helpMessage,
  monthlyRankingsFormat,
} from "./messages-helpers.js";
import { insertNewTimes } from "./global-helpers.js";
import { timeToSeconds } from "../tools/calculators.js";

const sendMessageToChannel = (channel) =>
  pipe((x) => channel.send(x), always(undefined));

const helpCommand = (x) =>
  pipe(
    prop("channel"),
    helpMessage,
    andThen(sendMessageToChannel(x.channel))
  )(x);

const newTimesCommand = ({ channel, author, args }) => {
  const messageSender = sendMessageToChannel(channel);
  const event = getEvent(args, messageSender);

  if (event)
    pipe(insertNewTimes, andThen(messageSender))(
      prop("id")(author),
      event,
      tail(args),
      channel.client.channels
    );
};

const dailyRanksCommand = ({ channel, args }) => {
  const messageSender = sendMessageToChannel(channel);

  const event = getEvent(args, messageSender);
  const date = getDate(args, event ? messageSender : always(undefined))?.format(
    "YYYY-MM-DD"
  );

  if (and(date)(event))
    pipe(
      getDayStandings,
      andThen(pipe(dailyRankingsFormat(date)(channel), andThen(messageSender)))
    )(date, event);
};

const monthlyRanksCommand = ({ channel, args }) => {
  const messageSender = sendMessageToChannel(channel);

  const event = getEvent(args, messageSender);
  const date = getDate(args, event ? messageSender : always(undefined))?.format(
    "YYYY-MM"
  );

  if (and(date)(event))
    pipe(
      getMonthStandings,
      andThen(
        pipe(monthlyRankingsFormat(date)(channel), andThen(messageSender))
      )
    )(date, event);
};

const idoCommand = ({ author, channel, args }) => {
  const messageSender = sendMessageToChannel(channel);
  const time = getTime(args, messageSender);
  if (time)
    pipe(
      addNotifSquad,
      andThen(messageSender("Vous avez bien été ajouté a la notif squad !"))
    )(prop("id")(author), time);
};

const idonotdoCommand = ({ author, channel, args }) => {
  const messageSender = sendMessageToChannel(channel);
  const time = getTime(args, messageSender);
  if (time)
    pipe(
      deleteNotifSquad,
      andThen(messageSender("Vous avez bien été supprimé de la notif squad !"))
    )(prop("id", author), time);
};

const pbCommand = ({ author, channel, args }) => {
  const messageSender = sendMessageToChannel(channel);

  const event = getEvent(args, F);

  const userName = join(" ", event ? tail(args) : args);
  const user =
    channel.members?.find(
      either(pipe(prop("nickname"), equals(userName)))(
        pipe(path(["user", "username"]), equals(userName))
      )
    )?.user ?? author;

  const displayPBforUser = displayPB(user);

  pipe(
    async (events) =>
      filter(
        propSatisfies(includes(__, events), "event"),
        (await getUserById(user.id))?.pb ?? []
      ),
    andThen(displayPBforUser),
    andThen(messageSender)
  )(event ? [event] : availableEvents);
};

const scrCommand = ({ channel, args }) => {
  const messageSender = sendMessageToChannel(channel);
  const event = getEvent(args, messageSender);
  const n = Number(args[1]);
  const numberOfAlgs = both(gt(6), lt(0))(n) ? n : 1;

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
