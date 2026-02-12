import winston from 'winston';
import env from '../env.js';

const customLevels = {
  levels: {
    alert: 0,
    crit: 1,
    error: 2,
    warn: 3,
    info: 4,
    debug: 7,
  },
  colors: {
    alert: 'magenta',
    crit: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
  },
};

winston.addColors(customLevels.colors);

interface CustomLogger extends winston.Logger {
  crit: winston.LeveledLogMethod;
  alert: winston.LeveledLogMethod;
}

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: 'debug',
  format:
    env.NODE_ENV === 'production'
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, ...rest }) => {
            const meta = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return `${timestamp} [${level}]: ${message}${meta}`;
          }),
        ),
  transports: [new winston.transports.Console()],
}) as CustomLogger;

export default logger;
