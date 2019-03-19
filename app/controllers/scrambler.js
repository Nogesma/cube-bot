const R = require('ramda');
const {Scrambow} = require('scrambow');

const scrambles = async event =>
  R.pipe(
    R.pluck('scramble_string'),
    R.join('``````')
  )(new Scrambow().setType(event).get(5));

const sendScrambles = (chan, event, date, scrambles) =>
  chan.send(
    R.join('', [
      `**Scrambles de ${event} du ${date}:**\n`,
      '```',
      scrambles,
      '```'
    ])
  );

module.exports = {
  scrambles,
  sendScrambles
};
