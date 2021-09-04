import chalk from 'chalk';
import { always, cond, equals, join, T, toUpper } from 'ramda';
import pkg from 'winston';
const { createLogger, format, transports } = pkg;

const { combine, timestamp, printf } = format;

const chooseColor = cond([
  [equals('silly'), always(chalk.gray)],
  [equals('debug'), always(chalk.yellow)],
  [equals('verbose'), always(chalk.green)],
  [equals('info'), always(chalk.blue)],
  [equals('warn'), always(chalk.magenta)],
  [equals('error'), always(chalk.red)],
  [T, always(chalk.white)],
]);

const myFormat = printf((info) => {
  const color = chooseColor(info.level);
  return join(' ', [
    color(`[${info.timestamp}] ${toUpper(info.level)}:`),
    info.message,
  ]);
});

const wl = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [new transports.Console()],
});

wl.level = process.env.LOG_LEVEL || 'info';

export default {
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
