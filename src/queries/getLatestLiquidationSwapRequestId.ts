import assert from 'assert';
import { lpClient } from '../server.js';
import { getLatestLiquidationSwapRequestIdQuery } from './lp.js';

export default async function getLatestLiquidationSwapRequestId() {
  const result = await lpClient.request(getLatestLiquidationSwapRequestIdQuery);

  assert(result.requests, 'Liquidation swap requests not found');
  assert(result.requests.nodes.length > 0, 'No liquidation swap requests found');

  return result.requests.nodes[0].id;
}
