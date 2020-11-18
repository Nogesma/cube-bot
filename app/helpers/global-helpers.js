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
  haveTimesForToday,
  updateCube,
  writeCube,
} from '../controllers/cube-db.js';

dayjs.extend(customParseFormat).extend(isBetween);

const inserNewTimes = async (author, event, solves) => {
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
    solves
  );

  return `Vos temps ont bien été ${
    hasCube ? 'modifiés' : 'enregistrés'
  }, ao5: ${secondsToTime(average)}`;
};

export { inserNewTimes };
