import { isNotNullish } from '@chainflip/utils/guard';
import BigNumber from 'bignumber.js';
import { type ChainflipAsset } from '../graphql/generated/lp/graphql.js';
import { lpClient } from '../server.js';
import { getBoostSummaryQuery } from './lp.js';
import { toAssetAmount, toUsdAmount } from '../utils/chainflip.js';

const apyToText = (apy?: number) => {
  if (isNotNullish(apy)) {
    const decimals = apy < 0.01 && apy > 0 ? 4 : 2;
    return `${apy.toFixed(decimals)}%`;
  }
  return '-';
};

export type BoostData = Awaited<ReturnType<typeof getBoostSummary>>;

export default async function getBoostSummary(start: Date, end: Date, asset: ChainflipAsset) {
  const args = { start: start.toISOString(), end: end.toISOString(), asset };

  const boostSummary = await lpClient.request(getBoostSummaryQuery, args);

  const boostedAmount = (boostSummary.boostPools?.nodes ?? []).reduce(
    (total, pool) => total.plus(pool.boostShares.aggregates?.sum?.amount ?? 0),
    new BigNumber(0),
  );

  const boostedAmountUsd = (boostSummary.boostPools?.nodes ?? []).reduce(
    (total, pool) => total.plus(pool.boostShares.aggregates?.sum?.amountUsd ?? 0),
    new BigNumber(0),
  );

  const earnedBoostFee = (boostSummary.boostPools?.nodes ?? []).reduce(
    (total, pool) => total.plus(pool.boostShares.aggregates?.sum?.fee ?? 0),
    new BigNumber(0),
  );

  const earnedBoostFeeUsd = (boostSummary.boostPools?.nodes ?? []).reduce(
    (total, pool) => total.plus(pool.boostShares.aggregates?.sum?.feeUsd ?? 0),
    new BigNumber(0),
  );

  const apys = boostSummary.boostPools?.nodes.flatMap((pool) =>
    pool.apys.nodes
      .filter((apy) => Number(apy.projectedApy) > 0)
      .map((apy) => ({
        feeTiers: pool.feeTierPips,
        currentApy: apyToText(Number(apy.projectedApy)),
      })),
  );
  return {
    boostedAmount: toAssetAmount(boostedAmount, asset),
    boostedAmountUsd: toUsdAmount(boostedAmountUsd),
    earnedBoostFee: toAssetAmount(earnedBoostFee, asset),
    earnedBoostFeeUsd: toUsdAmount(earnedBoostFeeUsd),
    apys,
  };
}
