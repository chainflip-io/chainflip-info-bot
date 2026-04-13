import { lpClient } from '../server.js';
import { getBoundaryLiquidationSwapRequestIdQuery } from './lp.js';

export default async function getBoundaryLiquidationSwapRequestId(minTimestamp: string) {
  const result = await lpClient.request(getBoundaryLiquidationSwapRequestIdQuery, { minTimestamp });

  return result.requests?.nodes?.at(0)?.swapRequestId ?? null;
}
