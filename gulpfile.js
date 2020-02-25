const { spawn } = require('child_process');
const { watch, parallel } = require('gulp');

const files = ['index-cube.js', 'app/**/*.js'];
let node;

const spawnBot = (cb) => {
  if (node) {
    node.kill();
  }

  node = spawn('node', ['index-cube.js'], { stdio: 'inherit' });
  return cb();
};

const watcher = () => watch(files, spawnBot);

exports.default = parallel(watcher, spawnBot);
