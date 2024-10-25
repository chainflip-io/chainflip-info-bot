import request from 'graphql-request';
import { BigNumber } from 'bignumber.js';
import { gql } from '../graphql/generated/gql.js';
import env from '../env.js';
import { formatUsdValue } from '../utils.js';

const getSwapVolumeStatsQuery = gql(/* GraphQL */ `
  query GetSwapVolumeStats($after: Datetime!) {
    swaps: allSwaps(filter: { swapExecutedBlockTimestamp: { greaterThanOrEqualTo: $after } }) {
      aggregates {
        sum {
          intermediateValueUsd
          swapOutputValueUsd
        }
      }
      nodes {
        fees: swapFeesBySwapId(filter: { type: { in: [NETWORK] } }) {
          nodes {
            valueUsd
          }
        }
      }
    }
    swapRequests: allSwapRequests(
      filter: { completedBlockTimestamp: { greaterThanOrEqualTo: $after } }
    ) {
      nodes {
        fees: swapFeesBySwapRequestId(condition: { type: BOOST }) {
          nodes {
            valueUsd
          }
        }
      }
    }
    burns: allBurns(filter: { timestamp: { greaterThanOrEqualTo: $after } }) {
      nodes {
        amount
      }
    }
  }
`);

const getLpFeeInfo = gql(/* GraphQL */ `
  query GetLpFeeInfo($after: Datetime!) {
    limitOrderFills: allLimitOrderFills(
      filter: { blockTimestamp: { greaterThanOrEqualTo: $after } }
    ) {
      aggregates {
        sum {
          feesEarnedValueUsd
        }
      }
    }
    rangeOrderFills: allRangeOrderFills(
      filter: { blockTimestamp: { greaterThanOrEqualTo: $after } }
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

export default async function getSwapVolumeStats(after: string) {
  const [swapInfo, lpInfo] = await Promise.all([
    request(env.EXPLORER_GATEWAY_URL, getSwapVolumeStatsQuery, { after }),
    request(env.LP_GATEWAY_URL, getLpFeeInfo, { after }),
  ]);

  const swapVolume = BigNumber.sum(
    swapInfo.swaps?.aggregates?.sum?.intermediateValueUsd ?? 0,
    swapInfo.swaps?.aggregates?.sum?.swapOutputValueUsd ?? 0,
  );

  const swapFees = swapInfo.swaps?.nodes.flatMap((swap) => swap.fees.nodes) ?? [];

  const networkFees = swapFees.reduce((acc, fee) => acc.plus(fee.valueUsd ?? 0), new BigNumber(0));

  const flipBurned = new BigNumber(swapInfo.burns?.nodes[0].amount ?? 0);

  const lpFees = BigNumber.sum(
    lpInfo.limitOrderFills?.aggregates?.sum?.feesEarnedValueUsd ?? 0,
    lpInfo.rangeOrderFills?.aggregates?.sum?.baseFeesEarnedValueUsd ?? 0,
    lpInfo.rangeOrderFills?.aggregates?.sum?.quoteFeesEarnedValueUsd ?? 0,
  );

  return {
    swapVolume: formatUsdValue(swapVolume),
    networkFees: formatUsdValue(networkFees),
    flipBurned: flipBurned.gt(0) ? flipBurned.shiftedBy(-18).toFormat(2) : null,
    lpFees: formatUsdValue(lpFees),
  };
}
