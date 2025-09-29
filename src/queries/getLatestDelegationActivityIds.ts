import assert from 'assert';
import { explorerClient } from '../server.js';
import { getDelegationActivityByIdQuery } from './explorer.js';

export default async function getLatestDelegationActivity({
  limit,
  lastId,
}: { limit?: number; lastId?: number } = {}) {
  const result = await explorerClient.request(getDelegationActivityByIdQuery, { lastId, limit });

  assert(result.activity, 'delegation activity is required');

  return result.activity.nodes;
}
