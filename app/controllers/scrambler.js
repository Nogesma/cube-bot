const Scrambo = require('scrambo');
const fs = require('fs-extra');

const event333 = async () => {
  return {scrambles: new Scrambo().get(5);, files: []};
};

const sendScrambles = async (chan, header, {scrambles, files}) => {
  await chan.send(header);
  scrambles.forEach(async (s, i) => {
    await chan.send(s, {files: [files[i]]});
  });
};

module.exports = {event333, sendScrambles};
