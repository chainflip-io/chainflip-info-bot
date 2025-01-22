import { assetConstants } from '@chainflip/utils/chainflip';
import { BigNumber } from 'bignumber.js';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient, lpClient } from '../server.js';

const getSwapVolumeStatsQuery = gql(/* GraphQL */ `
  query GetSwapVolumeStats($start: Datetime!, $end: Datetime!) {
    swaps: allSwaps(
      filter: {
        swapExecutedBlockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end }
      }
    ) {
      aggregates {
        sum {
          intermediateValueUsd
          swapOutputValueUsd
        }
      }
      nodes {
        fees: swapFeesBySwapId(condition: { type: NETWORK }) {
          nodes {
            valueUsd
          }
        }
      }
    }
    boostedSwapRequests: allSwapRequests(
      filter: {
        completedBlockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end }
        effectiveBoostFeeBps: { isNull: false }
      }
    ) {
      nodes {
        fees: swapFeesBySwapRequestId(condition: { type: BOOST }) {
          nodes {
            valueUsd
          }
        }
      }
    }
    burns: allBurns(
      filter: { timestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }
    ) {
      nodes {
        totalAmount
      }
    }
  }
`);

const getLpFeeInfo = gql(/* GraphQL */ `
  query GetLpFeeInfo($start: Datetime!, $end: Datetime!) {
    limitOrderFills: allLimitOrderFills(
      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }
    ) {
      aggregates {
        sum {
          feesEarnedValueUsd
        }
      }
    }
    rangeOrderFills: allRangeOrderFills(
      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }
    ) {
      aggregates {
        sum {
          baseFeesEarnedValueUsd
          quoteFeesEarnedValueUsd
        }
      }
    }
  }
`);

export type SwapStats = {
  swapVolume: BigNumber;
  networkFees: BigNumber;
  totalFlipBurned: BigNumber | null;
  lpFees: BigNumber;
  boostFees: BigNumber;
};

export default async function getSwapVolumeStats(start: Date, end: Date): Promise<SwapStats> {
  const args = { start: start.toISOString(), end: end.toISOString() };

  const [swapInfo, lpInfo] = await Promise.all([
    explorerClient.request(getSwapVolumeStatsQuery, args),
    lpClient.request(getLpFeeInfo, args),
  ]);

  const swapVolume = BigNumber.sum(
    swapInfo.swaps?.aggregates?.sum?.intermediateValueUsd ?? 0,
    swapInfo.swaps?.aggregates?.sum?.swapOutputValueUsd ?? 0,
  );

  const networkFees = (swapInfo.swaps?.nodes ?? []).reduce(
    (total, swap) => swap.fees.nodes.reduce((acc, fee) => acc.plus(fee.valueUsd ?? 0), total),
    new BigNumber(0),
  );

  const boostFees = (swapInfo.boostedSwapRequests?.nodes ?? []).reduce(
    (total, req) => req.fees.nodes.reduce((acc, fee) => acc.plus(fee.valueUsd ?? 0), total),
    new BigNumber(0),
  );

  const totalFlipBurned = BigNumber.sum(
    0,
    ...(swapInfo.burns?.nodes ?? []).map((burn) => burn.totalAmount),
  ).shiftedBy(-assetConstants.Flip.decimals);

  const lpFees = BigNumber.sum(
    lpInfo.limitOrderFills?.aggregates?.sum?.feesEarnedValueUsd ?? 0,
    lpInfo.rangeOrderFills?.aggregates?.sum?.baseFeesEarnedValueUsd ?? 0,
    lpInfo.rangeOrderFills?.aggregates?.sum?.quoteFeesEarnedValueUsd ?? 0,
  );

  return {
    swapVolume,
    networkFees,
    totalFlipBurned: totalFlipBurned.gt(0) ? totalFlipBurned : null,
    lpFees,
    boostFees,
  };
}
