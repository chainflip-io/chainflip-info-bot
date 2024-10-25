import { gql } from '../graphql/generated/gql.js';

export const getNewSwapRequestsQuery = gql(/* GraphQL */ `
  query GetNewSwapRequestsQuery($id: Int!) {
    swapRequests: allSwapRequests(filter: { id: { greaterThan: $id } }) {
      nodes {
        id
      }
    }
  }
`);
