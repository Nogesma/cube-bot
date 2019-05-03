const R = require('ramda');

const timeToSeconds = t => {
  if (t === 'DNF') {
    return Infinity;
  }

  if (t.match(/\+$/g) !== null) {
    t = t.slice(0, -1);
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

const getBestTime = times => times.reduce(R.min);

const computeScore = (numberOfContestants, rank) =>
  R.min(100, Math.ceil((-50 / (numberOfContestants - 1)) * rank) + 100);

const sortRankings = ranks => {
  const sorter = [R.ascend(R.prop('time')), R.ascend(R.prop('best'))];
  return R.ifElse(
    R.pipe(
      R.path([0, 'event']),
      R.equals('3BLD')
    ),
    R.sortWith(R.reverse(sorter)),
    R.sortWith(sorter)
  )(ranks);
};

module.exports = {
  averageOfFiveCalculator,
  timeToSeconds,
  secondsToTime,
  computeScore,
  getBestTime,
  sortRankings
};
