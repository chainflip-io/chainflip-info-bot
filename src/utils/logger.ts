import pino from 'pino';
import env from '../env.js';

const logger = pino.default({
  formatters: {
    level(label, _number) {
      return { level: label };
    },
    bindings() {
      return {};
    },
  },
  customLevels: {
    crit: 70,
    alert: 80,
  },
  transport: env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

export default logger;
