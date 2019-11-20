const R = require('ramda');
const { Scrambow } = require('scrambow');

const scrambles = event =>
  R.pipe(
    R.pluck('scramble_string'),
    R.map(R.replace(/\n/g, ' ')),
    R.join('``````')
  )(new Scrambow().setType(event).get(5));

const sendScrambles = R.curry((date, chan, scrambles) =>
  chan.send(
    R.join('\n', [`**Scrambles du ${date}:**`, '```', scrambles, '```'])
  )
);

module.exports = {
  scrambles,
  sendScrambles,
};
