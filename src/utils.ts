import assert from 'assert';
import { BigNumber } from 'bignumber.js';

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

export function formatUsdValue(value: BigNumber.Value, precise?: boolean): string;
export function formatUsdValue(value: null, precise?: boolean): null;
export function formatUsdValue(value: undefined, precise?: boolean): undefined;
export function formatUsdValue(
  value: BigNumber.Value | null | undefined,
  precise?: boolean,
): string | null | undefined;
export function formatUsdValue(
  value: BigNumber.Value | null | undefined,
  precise = true,
): string | null | undefined {
  if (value == null) return value;

  let usdAmount = new BigNumber(value);

  assert(usdAmount.gte(0), 'negative amounts not supported');

  if (!usdAmount.eq(0) && usdAmount.lt(0.01)) return `<$0.01`;

  let suffix = '';
  let decimals: number | undefined = 2;

  if (!precise) {
    if (usdAmount.gte(1_000_000_000_000)) {
      usdAmount = usdAmount.shiftedBy(-12);
      suffix = 'T';
    } else if (usdAmount.gte(1_000_000_000)) {
      usdAmount = usdAmount.shiftedBy(-9);
      suffix = 'B';
    } else if (usdAmount.gte(1_000_000)) {
      usdAmount = usdAmount.shiftedBy(-6);
      suffix = 'M';
    }

    if (suffix === '' && usdAmount.gte(10_000)) {
      decimals = 0;
    } else if (suffix !== '') {
      decimals = undefined;
    }
  }

  usdAmount = usdAmount.decimalPlaces(2);

  return `$${usdAmount.toFormat(decimals)}${suffix}`;
}
