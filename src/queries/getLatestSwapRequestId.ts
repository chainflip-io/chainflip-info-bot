import assert from 'assert';
import { explorerClient } from '../server.js';
import { latestSwapRequestIdQuery } from './explorer.js';

export default async function getLatestSwapRequestId() {
  const result = await explorerClient.request(latestSwapRequestIdQuery);

  const swapRequestId = result.swapRequests?.nodes[0].nativeId;
  assert(swapRequestId, 'No swap request found');

  return swapRequestId;
}
