const Scrambo = require('scrambo');
const download = require('images-downloader').images;
const fs = require('fs-extra');

const event333 = async () => {
  const scrambles = new Scrambo().get(5);
  const filesList = scrambles.map(s => [
    'http://roudai.net/visualcube/visualcube.php?fmt=gif&sch=wrgyob&alg=',
    s.replace(/ /g, '').replace(/'/g, '%27')
  ].join(''));
  await fs.ensureDir('./tmp');
  const files = (await download(filesList, './tmp')).map(f => f.filename);

  return {scrambles, files};
};

const sendScrambles = async (chan, header, {scrambles, files}) => {
  await chan.send(header);
  scrambles.forEach(async (s, i) => {
    await chan.send(s, {files: [files[i]]});
  });
};

module.exports = {event333, sendScrambles};
