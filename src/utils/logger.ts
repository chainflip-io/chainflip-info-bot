import pino from 'pino';
import env from '../env.js';

const logger = pino.default({
  formatters: {
    level(label, _number) {
      return { level: label };
    },
  },
  transport: env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
});

export default logger;
