import stringify from 'safe-stable-stringify';
import winston from 'winston';
import { ZodError } from 'zod';
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
});

const safeSerialize = (value: unknown): unknown => {
  const s = stringify(value);
  return s !== undefined ? JSON.parse(s) : null;
};

export const inspectError = (err: unknown) => {
  if (err instanceof ZodError) {
    return { name: err.name, message: err.message, issues: safeSerialize(err.issues) };
  }
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return safeSerialize(err);
};

export default logger;
