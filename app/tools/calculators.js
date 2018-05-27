const averageOfFiveCalculator = times => {
  times = times.map(a => Number(a));
  if (times.filter(a => !isNaN(a)).length === 5) {
    times.sort().shift();
    times.pop();
    return times.reduce((a, b) => a + b) / 3;
  }
  return 'You must give an array of 5 numbers';
};

module.exports = {averageOfFiveCalculator};
