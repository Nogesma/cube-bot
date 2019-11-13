const R = require('ramda');

const timeToSeconds = t => {
  if (t === 'DNF') {
    return Infinity;
  }

  if (R.test(/\+$/g, t)) {
    t = R.init(t);
  }

  return Number(
    R.reduce((acc, t) => 60 * acc + Number(t), 0, R.split(':', t)).toFixed(2)
  );
};

const secondsToTime = t => {
  const time = Number(t);
  if (time === Infinity) {
    return 'DNF';
  }

  const h = Math.floor(time / 3600);
  const min = Math.floor((time - h * 3600) / 60);
  let s = (time - h * 3600 - min * 60).toFixed(2);
  if (min > 0 && s.length === 4) {
    s = '0' + s;
  }

  return `${h ? h + ':' : ''}${h || min ? min + ':' : ''}${s}`;
};

const averageOfFiveCalculator = t => {
  let times = R.map(Number, t);
  if (R.length(R.filter(R.lt(0), times)) === 5) {
    times = R.slice(1, -1, R.sort(R.subtract, times));
    return Number((R.sum(times) / 3).toFixed(2));
  }

  return -Infinity;
};

const getBestTime = R.reduce(R.min, Infinity);

const computeScore = (numberOfContestants, rank) =>
  R.min(100, Math.ceil((-50 / (numberOfContestants - 1)) * rank) + 100);

const sorter = R.map(R.pipe(R.prop, R.ascend), ['time', 'best']);

const sortRankings = ranks =>
  R.sortWith(
    R.ifElse(
      R.pipe(R.path([0, 'event']), R.equals('3BLD')),
      R.always(R.reverse(sorter)),
      R.always(sorter)
    )(ranks),
    ranks
  );

module.exports = {
  averageOfFiveCalculator,
  timeToSeconds,
  secondsToTime,
  computeScore,
  getBestTime,
  sortRankings,
};
