import request from 'graphql-request';
import env from '../env.js';
import { gql } from '../graphql/generated/gql.js';

const getNewSwapRequestsQuery = gql(/* GraphQL */ `
  query GetNewSwapRequestsQuery($nativeId: BigInt!) {
    swapRequests: allSwapRequests(
      filter: {
        and: [
          { nativeId: { greaterThan: $nativeId } }
          { or: [{ type: { equalTo: REGULAR } }, { type: { equalTo: CCM } }] }
        ]
      }
      orderBy: NATIVE_ID_ASC
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

  return (result.swapRequests?.nodes ?? []).map((node) => node.nativeId);
}
