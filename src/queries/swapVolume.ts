import { BigNumber } from 'bignumber.js';
import request from 'graphql-request';
import env from '../env.js';
import { gql } from '../graphql/generated/gql.js';

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
    swapRequests: allSwapRequests(
      filter: { completedBlockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }
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
        amount
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
  flipBurned: BigNumber | null;
  lpFees: BigNumber;
};

export default async function getSwapVolumeStats(start: Date, end: Date): Promise<SwapStats> {
  const args = { start: start.toISOString(), end: end.toISOString() };

  const [swapInfo, lpInfo] = await Promise.all([
    request(env.EXPLORER_GATEWAY_URL, getSwapVolumeStatsQuery, args),
    request(env.LP_GATEWAY_URL, getLpFeeInfo, args),
  ]);

  const swapVolume = BigNumber.sum(
    swapInfo.swaps?.aggregates?.sum?.intermediateValueUsd ?? 0,
    swapInfo.swaps?.aggregates?.sum?.swapOutputValueUsd ?? 0,
  );

  const swapFees = swapInfo.swaps?.nodes.flatMap((swap) => swap.fees.nodes) ?? [];

  const networkFees = swapFees.reduce((acc, fee) => acc.plus(fee.valueUsd ?? 0), new BigNumber(0));

  const flipBurned = new BigNumber(swapInfo.burns?.nodes[0].amount ?? 0).shiftedBy(-18);

  const lpFees = BigNumber.sum(
    lpInfo.limitOrderFills?.aggregates?.sum?.feesEarnedValueUsd ?? 0,
    lpInfo.rangeOrderFills?.aggregates?.sum?.baseFeesEarnedValueUsd ?? 0,
    lpInfo.rangeOrderFills?.aggregates?.sum?.quoteFeesEarnedValueUsd ?? 0,
  );

  return {
    swapVolume,
    networkFees,
    flipBurned: flipBurned.gt(0) ? flipBurned : null,
    lpFees,
  };
}
