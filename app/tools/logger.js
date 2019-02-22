const {createLogger, format, transports} = require('winston');
const chalk = require('chalk');

const {combine, timestamp, printf} = format;

const chooseColor = level => {
  switch (level) {
    case 'silly':
      return chalk.gray;
    case 'debug':
      return chalk.yellow;
    case 'verbose':
      return chalk.green;
    case 'info':
      return chalk.blue;
    case 'warn':
      return chalk.magenta;
    case 'error':
      return chalk.red;
    default:
      return chalk.white;
  }
};

const myFormat = printf(info => {
  const color = chooseColor(info.level);
  return [
    color(`[${info.timestamp}] ${info.level.toUpperCase()}:`),
    info.message
  ].join(' ');
});

const wl = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [new transports.Console()]
});

wl.level = process.env.LOG_LEVEL || 'info';

const logger = {
  silly(msg) {
    wl.log('silly', msg);
  },
  debug(msg) {
    wl.log('debug', msg);
  },
  verbose(msg) {
    wl.log('verbose', msg);
  },
  info(msg) {
    wl.log('info', msg);
  },
  warn(msg) {
    wl.log('warn', msg);
  },
  error(msg) {
    wl.log('error', msg);
  },
  log(level, msg) {
    wl.log(level, msg);
  }
};

module.exports = logger;
