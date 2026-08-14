import { explorerClient } from '../server.js';

const query = /* GraphQL */ `
  query GetLargestSwaps {
    swaps: allSwapRequests(
      orderBy: DEPOSIT_VALUE_USD_DESC
      first: 25
      filter: { depositValueUsd: { isNull: false }, completedEventId: { isNull: false } }
    ) {
      nodes {
        nativeId
        egressByEgressId {
          valueUsd
        }
      }
    }
  }
`;

type Result = {
  swaps: {
    nodes: { nativeId: string; egressByEgressId: { valueUsd: string | null } | null }[];
  };
};

// Largest swap output value (USD) across all swaps, excluding the given one.
// Returns 0 if nothing comparable is found (callers treat that as "no record known").
export default async function getLargestSwapValue(excludeNativeId: string): Promise<number> {
  const result = await explorerClient.request<Result>(query);
  const values = result.swaps.nodes
    .filter((node) => node.nativeId !== excludeNativeId)
    .map((node) => Number(node.egressByEgressId?.valueUsd ?? 0))
    .filter((value) => Number.isFinite(value) && value > 0);

  return values.length ? Math.max(...values) : 0;
}
