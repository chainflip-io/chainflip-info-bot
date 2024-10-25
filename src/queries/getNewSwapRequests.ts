import { gql } from '../graphql/generated/gql.js';

export const getNewSwapRequestsQuery = gql(/* GraphQL */ `
  query GetNewSwapRequestsQuery($nativeId: BigInt!) {
    swapRequests: allSwapRequests(
      filter: {
        and: [
          { nativeId: { greaterThan: $nativeId } }
          { or: [{ type: { equalTo: REGULAR } }, { type: { equalTo: CCM } }] }
        ]
      }
    ) {
      nodes {
        id
      }
    }
  }
`);
