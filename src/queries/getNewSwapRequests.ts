import assert from 'assert';
import { explorerClient } from '../server.js';
import { getNewSwapRequestsQuery } from './explorer.js';

export default async function getNewSwapRequests(latestSwapRequestId: string) {
  const result = await explorerClient.request(getNewSwapRequestsQuery, {
    nativeId: latestSwapRequestId,
  });

  assert(result.swapRequests, 'swapRequests is required');

  return result.swapRequests.nodes.map((node) => node.nativeId);
}
