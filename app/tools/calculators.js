const timeToSeconds = t => {
  if (t === 'DNF') {
    t = '99999';
  } else if (t.match(/\+$/g) !== null) {
    t = t.slice(0, -1);
  }
  t = t.split(':').reduce((acc, t) => (60 * Number(acc)) + Number(t), 0);
  return t;
};

const secondsToTime = t => {
  const h = Math.floor(t / 3600);
  const min = Math.floor((t - (h * 3600)) / 60);
  const s = Math.round((t - (h * 3600) - (min * 60)) * 100) / 100;
  return `${h ? h + ':' : ''}${h || min ? min + ':' : ''}${s}`;
};

const averageOfFiveCalculator = times => {
  times = times.map(a => Number(a));
  if (times.filter(a => !isNaN(a) && a > 0).length === 5) {
    times.sort((a, b) => a - b).shift();
    times.pop();
    return Math.round((times.reduce((a, b) => a + b) / 3) * 100) / 100;
  }
  return 'You must give an array of 5 positive numbers';
};

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
  computeScore
};
