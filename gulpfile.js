import { spawn } from 'child_process';
import pkg from 'gulp';
const { watch, parallel } = pkg;

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

export default parallel(watcher, spawnBot);
