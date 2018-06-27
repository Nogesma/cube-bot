const averageOfFiveCalculator = times => {
  times = times.map(a => Number(a));
  if (times.filter(a => !isNaN(a)).length === 5) {
    times.sort((a, b) => a - b).shift();
    times.pop();
    return Math.round((times.reduce((a, b) => a + b) / 3) * 1000) / 1000;
  }
  return 'You must give an array of 5 numbers';
};

const computeScore = (numberOfContestants, rank) => {
  if (rank === 0) {
    return 100;
  }

  if (rank === numberOfContestants - 1) {
    return 50;
  }

  const a = -50 / (numberOfContestants - 1);
  return Math.ceil(a * rank) + 100;
};

module.exports = {averageOfFiveCalculator, computeScore};
