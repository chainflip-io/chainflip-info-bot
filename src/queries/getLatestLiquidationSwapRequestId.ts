import { lpClient } from '../server.js';
import { getLatestLiquidationSwapRequestIdQuery } from './lp.js';

export default async function getLatestLiquidationSwapRequestId() {
  const result = await lpClient.request(getLatestLiquidationSwapRequestIdQuery);

  return result.requests?.nodes[0].swapRequestId ?? `0`;
}
