import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import isBetween from 'dayjs/plugin/isBetween.js';
import R from 'ramda';
import {
  averageOfFiveCalculator,
  getBestTime,
  secondsToTime,
  timeToSeconds,
} from '../tools/calculators.js';
import {
  getDayStandings,
  haveTimesForToday,
  updateCube,
  writeCube,
} from '../controllers/cube-db.js';
import { dailyRankingsFormat } from './messages-helpers.js';

dayjs.extend(customParseFormat).extend(isBetween);

const inserNewTimes = async (author, event, solves, channels) => {
  const resultTime = dayjs('23:59', 'H:m');
  if (dayjs().isBetween(resultTime, resultTime.add(2, 'm'))) {
    return 'Vous ne pouvez pas soumettre de temps pendant la phase des résultats';
  }

  if (solves.length !== 5) {
    return 'Veuillez entrer 5 temps';
  }

  const times = R.map(timeToSeconds, solves);
  const average = averageOfFiveCalculator(times);
  const single = getBestTime(times);

  if (average < 0) {
    return 'Veuillez entrer des temps valides';
  }

  const date = resultTime.format('YYYY-MM-DD');

  const hasCube = await haveTimesForToday(date, author, event);

  await (hasCube ? updateCube : writeCube)(
    author,
    date,
    event,
    average,
    single,
    times
  );

  updateDiscordRanking(date, event, channels);

  return `Vos temps ont bien été ${
    hasCube ? 'modifiés' : 'enregistrés'
  }, ao5: ${secondsToTime(average)}`;
};

const updateDiscordRanking = async (date, event, channels) => {
  const chan = await channels.fetch(R.path(['env', event], process));

  R.pipe(
    getDayStandings,
    R.andThen(dailyRankingsFormat(date)(chan)),
    R.andThen((x) =>
      chan.messages
        .fetch({ limit: 1 })
        .then((messages) => messages.first().edit(x))
    )
  )(date, event);
};

export { inserNewTimes };
