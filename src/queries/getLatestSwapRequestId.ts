import assert from 'assert';
import request from 'graphql-request';
import env from '../env.js';
import { gql } from '../graphql/generated/gql.js';

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
  const result = await request(env.EXPLORER_GATEWAY_URL, latestSwapRequestIdQuery);

  const swapRequestId = result.swapRequests?.nodes[0].nativeId;
  assert(swapRequestId, 'No swap request found');

  return swapRequestId;
}
