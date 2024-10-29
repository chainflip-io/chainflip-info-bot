import assert from 'assert';
import request from 'graphql-request';
import env from '../env.js';
import { gql } from '../graphql/generated/gql.js';

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
  const result = await request(env.EXPLORER_GATEWAY_URL, getNewSwapRequestsQuery, {
    nativeId: latestSwapRequestId,
  });

  assert(result.swapRequests, 'swapRequests is required');

  return result.swapRequests.nodes.map((node) => node.nativeId);
}
