const R = require('ramda');
const { Scrambow } = require('scrambow');

const getScrambles = (event, number) =>
  R.pipe(
    R.pluck('scramble_string'),
    R.map(R.replace(/\n/g, ' ')),
    R.join('``````'),
    (x) => R.join('', ['```', x, '```'])
  )(new Scrambow().setType(event).get(number));

const sendScrambles = R.curry((date, chan, scrambles) =>
  chan.send(R.join('\n', [`**Scrambles du ${date}:**`, scrambles]))
);

module.exports = {
  getScrambles,
  sendScrambles,
};
