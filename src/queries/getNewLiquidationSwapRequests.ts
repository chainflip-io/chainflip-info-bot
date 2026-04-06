import { lpClient } from '../server.js';
import { getNewLiquidationSwapRequestsQuery } from './lp.js';

export default async function getNewLiquidationSwapRequests(
  latestLiquidationSwapRequestId: `${number}`,
  minTimestamp: string,
) {
  const result = await lpClient.request(getNewLiquidationSwapRequestsQuery, {
    swapRequestId: latestLiquidationSwapRequestId,
    minTimestamp,
  });

  if (!result.requests?.nodes.length) return [];

  return result.requests.nodes;
}
