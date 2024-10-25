import request from 'graphql-request';
import { gql } from '../graphql/generated/gql.js';
import env from '../env.js';
import { BigNumber } from 'bignumber.js';
import { FLIP_DECIMAL_POINTS } from '../consts.js';

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
  const result = await request(env.EXPLORER_GATEWAY_URL, getBurnsQuery, { in: ids });

  return {
    amount: new BigNumber(result.allBurns?.aggregates?.sum?.amount ?? 0).shiftedBy(
      -FLIP_DECIMAL_POINTS,
    ),
    valueUsd: new BigNumber(result.allBurns?.aggregates?.sum?.valueUsd ?? 0),
  };
}
