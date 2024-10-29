import assert from 'assert';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient } from '../server.js';

const getNewSwapRequestsQuery = gql(/* GraphQL */ `
  query GetNewSwapRequestsQuery($nativeId: BigInt!) {
    swapRequests: allSwapRequests(
      filter: { nativeId: { greaterThan: $nativeId }, type: { in: [REGULAR, CCM] } }
    ) {
      nodes {
        nativeId
      }
    }
  }
`);

export default async function getNewSwapRequests(latestSwapRequestId: string) {
  const result = await explorerClient.request(getNewSwapRequestsQuery, {
    nativeId: latestSwapRequestId,
  });

  assert(result.swapRequests, 'swapRequests is required');

  return result.swapRequests.nodes.map((node) => node.nativeId);
}
