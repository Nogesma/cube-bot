const { spawn } = require('child_process');
const { src, watch, series, parallel } = require('gulp');
const xo = require('gulp-xo');

const files = ['index-cube.js', 'app/**/*.js'];
let node;

const runXO = () =>
  src(files)
    .pipe(xo())
    .pipe(xo.format())
    .pipe(xo.failAfterError());

const spawnBot = cb => {
  if (node) {
    node.kill();
  }

  node = spawn('node', ['index-cube.js'], { stdio: 'inherit' });
  return cb();
};

const watcher = () => watch(files, series(runXO, spawnBot));

exports.default = series(runXO, parallel(watcher, spawnBot));
exports.n = parallel(watcher, spawnBot);
