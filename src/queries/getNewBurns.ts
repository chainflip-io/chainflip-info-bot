import assert from 'assert';
import { BigNumber } from 'bignumber.js';
import { FLIP_DECIMAL_POINTS } from '../consts.js';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient } from '../server.js';

const getNewBurnsQuery = gql(/* GraphQL */ `
  query getNewBurns($id: Int!) {
    burns: allBurns(filter: { id: { greaterThan: $id } }, orderBy: ID_DESC) {
      nodes {
        id
        amount
        valueUsd
        event: eventByEventId {
          blockId
          indexInBlock
          block: blockByBlockId {
            timestamp
          }
        }
      }
    }
  }
`);

export default async function getNewBurns(latestBurnId: number) {
  const result = await explorerClient.request(getNewBurnsQuery, { id: latestBurnId });

  assert(result.burns, 'burns is required');

  return result.burns.nodes.map((node) => ({
    ...node,
    amount: new BigNumber(node.amount).shiftedBy(-FLIP_DECIMAL_POINTS),
  }));
}
