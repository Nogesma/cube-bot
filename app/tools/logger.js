const chalk = require('chalk');
const R = require('ramda');
const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf } = format;

const chooseColor = R.cond([
  [R.equals('silly'), R.always(chalk.gray)],
  [R.equals('debug'), R.always(chalk.yellow)],
  [R.equals('verbose'), R.always(chalk.green)],
  [R.equals('info'), R.always(chalk.blue)],
  [R.equals('warn'), R.always(chalk.magenta)],
  [R.equals('error'), R.always(chalk.red)],
  [R.T, R.always(chalk.white)],
]);

const myFormat = printf(info => {
  const color = chooseColor(info.level);
  return R.join(' ', [
    color(`[${info.timestamp}] ${R.toUpper(info.level)}:`),
    info.message,
  ]);
});

const wl = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [new transports.Console()],
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
  },
};

module.exports = logger;
