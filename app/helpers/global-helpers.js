import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import isBetween from "dayjs/plugin/isBetween.js";
import { andThen, path, pipe } from "ramda";
import {
  averageOfFiveCalculator,
  getBestTime,
  secondsToTime,
} from "../tools/calculators.js";
import {
  getDayStandings,
  haveTimesForToday,
  updateCube,
  writeCube,
} from "../controllers/cube-db.js";
import { dailyRankingsFormat } from "./messages-helpers.js";

dayjs.extend(customParseFormat).extend(isBetween);

const insertNewTimes = async (author, event, solves, channels) => {
  const resultTime = dayjs("23:59", "H:m");
  if (dayjs().isBetween(resultTime, resultTime.add(2, "m"))) {
    return "Vous ne pouvez pas soumettre de temps pendant la phase des résultats";
  }

  if (solves.length !== 5) {
    return "Veuillez entrer 5 temps";
  }

  const average = averageOfFiveCalculator(solves);
  const single = getBestTime(solves);

  if (average < 0) {
    return "Veuillez entrer des temps valides";
  }

  const date = resultTime.format("YYYY-MM-DD");

  const hasCube = await haveTimesForToday(date, author, event);

  await (hasCube ? updateCube : writeCube)(
    author,
    date,
    event,
    average,
    single,
    solves
  );

  await updateDiscordRanking(date, event, channels);

  return `Vos temps ont bien été ${
    hasCube ? "modifiés" : "enregistrés"
  }, ao5: ${secondsToTime(average)}`;
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
        .then((messages) => messages.first().edit(x))
    )
  )(date, event);
};

export { insertNewTimes, prependEvent };
