const R = require('ramda');

const timeToSeconds = (time) => {
  if (time === 'DNF') {
    return Infinity;
  }

  return Number(
    R.head(
      R.match(
        /\d+\.\d{1,2}/g,
        String(
          R.reduce((acc, t) => 60 * acc + Number(t), 0, R.split(':', time))
        )
      )
    )
  );
};

const secondsToTime = (time) => {
  if (time === Infinity) {
    return 'DNF';
  }

  const min = Math.floor(time / 60);
  let s = (time - min * 60).toFixed(2);
  if (min > 0 && s.length === 4) {
    s = '0' + s;
  }

  return `${min ? min + ':' : ''}${s}`;
};

const averageOfFiveCalculator = (times) => {
  if (R.length(R.filter(R.lt(0), times)) === 5) {
    times = R.slice(1, -1, R.sort(R.subtract, times));
    return Number((R.sum(times) / 3).toFixed(2));
  }

  return -Infinity;
};

const getBestTime = R.reduce(R.min, Infinity);

const computeScore = (numberOfContestants, rank) =>
  R.min(100, Math.ceil((-50 / (numberOfContestants - 1)) * rank) + 100);

const sorter = R.map(R.pipe(R.prop, R.ascend), ['average', 'single']);

const sortRankings = (ranks) =>
  R.sortWith(
    R.ifElse(
      R.pipe(R.path([0, 'event']), R.equals('3BLD')),
      R.always(R.reverse(sorter)),
      R.always(sorter)
    )(ranks),
    ranks
  );

const getPB = (t) => ({
  single: secondsToTime(getBestTime(R.map(R.prop('single'), t))),
  average: secondsToTime(getBestTime(R.map(R.prop('average'), t))),
});

module.exports = {
  averageOfFiveCalculator,
  timeToSeconds,
  secondsToTime,
  computeScore,
  getBestTime,
  sortRankings,
  getPB,
};
