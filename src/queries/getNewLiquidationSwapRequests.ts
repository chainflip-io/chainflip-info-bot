import { isNotNullish } from '@chainflip/utils/guard';
import { lpClient } from '../server.js';
import { getNewLiquidationSwapRequestsQuery } from './lp.js';

export default async function getNewLiquidationSwapRequests(
  latestLiquidationSwapRequestId: number,
) {
  const result = await lpClient.request(getNewLiquidationSwapRequestsQuery, {
    id: latestLiquidationSwapRequestId,
  });

  if (!result.requests?.nodes.length) return [];

  return result.requests.nodes.map((node) => ({
    ...node,
    isCompleted: isNotNullish(node.completedAtEventId) || isNotNullish(node.abortedAtEventId),
  }));
}
