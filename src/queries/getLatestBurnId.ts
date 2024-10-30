import assert from 'assert';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient } from '../server.js';

const getLatestBurnQuery = gql(/* GraphQL */ `
  query getLatestBurn {
    burns: allBurns(first: 1, orderBy: ID_DESC) {
      nodes {
        id
      }
    }
  }
`);

export default async function getLatestBurnId() {
  const result = await explorerClient.request(getLatestBurnQuery);

  assert(result.burns, 'Burns not found');
  assert(result.burns.nodes.length > 0, 'No burn found');

  return result.burns?.nodes[0];
}
