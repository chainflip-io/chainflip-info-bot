import { gql } from '../graphql/generated/gql.js';

export const getNewSwapRequestsQuery = gql(/* GraphQL */ `
  query GetNewSwapRequests($nativeId: BigInt!) {
    swapRequests: allSwapRequests(
      filter: { nativeId: { greaterThan: $nativeId }, type: { in: [REGULAR, CCM] } }
    ) {
      nodes {
        nativeId
      }
    }
  }
`);
