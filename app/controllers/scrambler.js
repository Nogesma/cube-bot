const R = require('ramda');
const {Scrambow} = require('scrambow');

const event333 = async () => R.pluck('scramble_string', new Scrambow().get(5));

const sendScrambles = async (chan, header, scrambles) => {
  await chan.send(header);
  scrambles.forEach(async s => {
    await chan.send(s);
  });
};

module.exports = {event333, sendScrambles};
