import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { andThen, ifElse, map, path, pipe } from "ramda";
import {
  averageOfFiveCalculator,
  getBestTime,
  meanOfThreeCalculator,
  secondsToTime,
  timeToSeconds,
} from "../tools/calculators.js";
import {
  getDayStandings,
  haveTimesForToday,
  updateCube,
  writeCube,
} from "../controllers/cube-db.js";
import { dailyRankingsFormat } from "./messages-helpers.js";

dayjs.extend(customParseFormat);

const insertNewTimes = async (author, event, solves, channels) => {
  const timeLimitStart = dayjs("00:01", "H:m");
  const timeLimitEnd = dayjs("23:59", "H:m");

  const now = dayjs();

  if (now.isBefore(timeLimitStart) || now.isAfter(timeLimitEnd)) {
    return "Vous ne pouvez pas soumettre de temps pendant la phase des résultats";
  }

  const isMo3 = ["666", "777"].includes(event);
  if (isMo3) {
    if (solves.length !== 3) return "Veuillez entrer 3 temps";
  } else if (solves.length !== 5) return "Veuillez entrer 5 temps";

  const times = map(timeToSeconds, solves);

  const average = (isMo3 ? meanOfThreeCalculator : averageOfFiveCalculator)(
    times
  );

  const single = getBestTime(times);

  if (average < 0) {
    return "Veuillez entrer des temps valides";
  }

  const date = now.format("YYYY-MM-DD");

  const hasCube = await haveTimesForToday(date, author, event);

  await (hasCube ? updateCube : writeCube)(
    author,
    date,
    event,
    average,
    single,
    times
  );

  await updateDiscordRanking(date, event, channels);

  return `Vos temps ont bien été ${hasCube ? "modifiés" : "enregistrés"}, ${
    isMo3 ? "mo3" : "ao5"
  }: ${secondsToTime(average)}`;
};

const prependEvent = (event) => "EVENT_" + event;

const updateDiscordRanking = async (date, event, channels) => {
  const chan = await channels.fetch(
    path(["env", prependEvent(event)], process)
  );

  pipe(
    getDayStandings,
    andThen(dailyRankingsFormat(date)(chan)),
    andThen((x) =>
      chan.messages
        .fetch({ limit: 1 })
        .then((messages) => messages.first()?.edit(x))
    )
  )(date, event);
};

export { insertNewTimes, prependEvent };
