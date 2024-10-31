import pino from 'pino';
import env from '../env.js';

const logger = pino.default(
  env.NODE_ENV !== 'production'
    ? { transport: { target: 'pino-pretty', options: { coloize: true } } }
    : {},
);

export default logger;
