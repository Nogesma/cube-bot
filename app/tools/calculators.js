const R = require('ramda');

const timeToSeconds = t => {
  if (t === 'DNF') {
    return Infinity;
  }
  if (t.match(/\+$/g) !== null) {
    t = t.slice(0, -1);
  }
  t = Math.round(t.split(':')
    .reduce((acc, t) => (60 * Number(acc)) + Number(t), 0) * 100) / 100;
  return t;
};

const secondsToTime = t => {
  const time = Number(t);
  if (time === Infinity) {
    return 'DNF';
  }
  const h = Math.floor(time / 3600);
  const min = Math.floor((time - (h * 3600)) / 60);
  let s = (Math.round((time - (h * 3600) - (min * 60)) * 100) / 100).toFixed(2);
  if (min > 0 && s.length === 4) {
    s = '0' + s.toString();
  }
  return `${h ? h + ':' : ''}${h || min ? min + ':' : ''}${s}`;
};

const averageOfFiveCalculator = t => {
  let times = t.map(a => Number(a));
  if (times.filter(a => !isNaN(a) && a > 0).length === 5) {
    times = times.sort((a, b) => a - b).slice(1, -1);
    return Math.round((times.reduce((a, b) => a + b) / 3) * 100) / 100;
  }
  return -Infinity;
};

const getBestTime = times => times.reduce((a, b) => R.min(a, b));

const computeScore = (numberOfContestants, rank) => {
  if (numberOfContestants === 1) {
    return 100;
  }
  const a = -50 / (numberOfContestants - 1);
  return Math.ceil(a * rank) + 100;
};

module.exports = {
  averageOfFiveCalculator,
  timeToSeconds,
  secondsToTime,
  computeScore,
  getBestTime
};
