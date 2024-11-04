import logger from './logger.js';

const cleanupFns = new Set<() => void>();

export const handleExit = (fn: () => void) => {
  cleanupFns.add(fn);

  return () => {
    cleanupFns.delete(fn);
  };
};

const cleanup = () => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns.clear();
};

process.once('SIGINT', cleanup);
process.once('SIGTERM', cleanup);

export const logRejections =
  <T, F extends (...args: any[]) => Promise<T>>(name: string, fn: F) =>
  (...args: Parameters<F>): Promise<T> =>
    fn(...args).catch((err: unknown) => {
      logger.error({ name, err }, 'error occurred in job queue');
      throw err;
    });
