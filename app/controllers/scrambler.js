const R = require('ramda');
const {Scrambow} = require('scrambow');

const event333 = async () => R.pipe(
  R.pluck('scramble_string'),
  R.map(R.trim),
  R.join('\n')
)(new Scrambow().get(5));

const event222 = async () => R.pipe(
  R.pluck('scramble_string'),
  R.map(R.trim),
  R.join('\n')
)(new Scrambow().setType('222').get(5));

const sendScrambles = (chan, event, date, scrambles) =>
  chan.send(`Scrambles ${event} (${date})\n` + scrambles);

module.exports = {event333, event222, sendScrambles};
