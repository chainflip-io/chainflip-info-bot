import { assetConstants } from '@chainflip/utils/chainflip';
import assert from 'assert';
import { BigNumber } from 'bignumber.js';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient } from '../server.js';

const getNewBurnQuery = gql(/* GraphQL */ `
  query getNewBurn($id: Int!) {
    burns: allBurns(filter: { id: { greaterThan: $id } }, orderBy: ID_DESC, first: 1) {
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

export default async function getNewBurn(latestBurnId: number) {
  const result = await explorerClient.request(getNewBurnQuery, { id: latestBurnId });

  assert(result.burns, 'burns is required');
  if (result.burns.nodes.length === 0) {
    return null;
  }

  const node = result.burns.nodes[0];
  return {
    ...node,
    amount: new BigNumber(node.amount).shiftedBy(-assetConstants.Flip.decimals),
  };
}
