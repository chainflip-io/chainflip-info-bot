import { isNotNullish } from '@chainflip/utils/guard';
import assert from 'assert';
import { lpClient } from '../server.js';
import { getLiquidationStatusBySwapRequestIdsQuery } from './lp.js';

export default async function getLiquidationStatus(swapRequestIds: `${number}`[]) {
  const result = await lpClient.request(getLiquidationStatusBySwapRequestIdsQuery, {
    swapRequestIds,
  });

  assert(result.requests, 'Liquidation swap requests are required');
  assert(result.requests.nodes.length > 0, 'Liquidation swap requests must exist');

  return result.requests.nodes.map((node) => ({
    ...node,
    isCompleted: isNotNullish(node.completedAtEventId) || isNotNullish(node.abortedAtEventId),
  }));
}
