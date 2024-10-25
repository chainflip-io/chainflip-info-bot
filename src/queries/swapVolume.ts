import request from 'graphql-request';
import { BigNumber } from 'bignumber.js';
import { gql } from '../graphql/generated/gql.js';
import env from '../env.js';

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

export default async function getSwapVolumeStats(after: string) {
  const result = await request(env.EXPLORER_GATEWAY_URL, getSwapVolumeStatsQuery, { after });

  const swapVolume = BigNumber.sum(
    result.swaps?.aggregates?.sum?.intermediateValueUsd ?? 0,
    result.swaps?.aggregates?.sum?.swapOutputValueUsd ?? 0,
  );

  const swapFees = result.swaps?.nodes.flatMap((swap) => swap.fees.nodes) ?? [];

  const networkFees = swapFees.reduce((acc, fee) => acc.plus(fee.valueUsd ?? 0), new BigNumber(0));

  return {
    swapVolume: swapVolume.toFormat(2),
    networkFees: networkFees.toFormat(2),
  };
}
