import { BigNumber } from 'bignumber.js';
import { FLIP_DECIMAL_POINTS } from '../consts.js';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient } from '../server.js';

const getBurnsQuery = gql(/* GraphQL */ `
  query getBurns($in: [Int!]) {
    allBurns(filter: { id: { in: $in } }) {
      aggregates {
        sum {
          amount
          valueUsd
        }
      }
    }
  }
`);

export default async function getBurns(ids: number[]) {
  const result = await explorerClient.request(getBurnsQuery, { in: ids });

  return {
    amount: new BigNumber(result.allBurns?.aggregates?.sum?.amount ?? 0).shiftedBy(
      -FLIP_DECIMAL_POINTS,
    ),
    valueUsd: new BigNumber(result.allBurns?.aggregates?.sum?.valueUsd ?? 0),
  };
}
