import assert from 'assert';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient } from '../server.js';

const latestSwapRequestIdQuery = gql(/* GraphQL */ `
  query LatestSwapRequest {
    swapRequests: allSwapRequests(first: 1, orderBy: NATIVE_ID_DESC) {
      nodes {
        nativeId
      }
    }
  }
`);

export default async function getLatestSwapRequestId() {
  const result = await explorerClient.request(latestSwapRequestIdQuery);

  const swapRequestId = result.swapRequests?.nodes[0].nativeId;
  assert(swapRequestId, 'No swap request found');

  return swapRequestId;
}
