const {spawn} = require('child_process');
const {src, watch, series, parallel} = require('gulp');
const xo = require('gulp-xo');

const files = ['index-cube.js', 'app/**/*.js'];

const runXO = () =>
  src(files)
    .pipe(xo())
    .pipe(xo.format())
    .pipe(xo.failAfterError());

const startDB = () => spawn('mongod');

const spawnBot = () => spawn('node', ['index-cube.js'], {stdio: 'inherit'});

watch(files, series(runXO, spawnBot));

exports.default = series(runXO, parallel(startDB, spawnBot));
exports.n = parallel(startDB, spawnBot);
