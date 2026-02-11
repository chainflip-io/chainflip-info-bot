import { BigNumber } from 'bignumber.js';
import { UnrecoverableError } from 'bullmq';
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
      logger.error('error occurred in job queue', { name, err });
      throw err;
    });

export function formatUsdValue(
  value: number | bigint | Intl.StringNumericLiteral | BigNumber,
): string;
export function formatUsdValue(
  value: number | bigint | Intl.StringNumericLiteral | BigNumber | null | undefined,
): string | null | undefined;
export function formatUsdValue(
  value: number | bigint | Intl.StringNumericLiteral | BigNumber | null | undefined,
) {
  if (value == null) return value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(BigNumber.isBigNumber(value) ? value.toNumber() : value);
}

export function unrecoverableAssert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new UnrecoverableError(message || 'Unrecoverable assertion failed');
  }
}
