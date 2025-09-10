import assert from 'assert';
import { explorerClient } from '../server.js';
import { getNewDelegationActivityRequestsQuery } from './explorer.js';

export default async function getNewDelegationActivity(latestDelegationActivityRequestId: number) {
  const result = await explorerClient.request(getNewDelegationActivityRequestsQuery, {
    id: latestDelegationActivityRequestId,
  });

  assert(result.delegationActivities, 'delegation activity is required');

  return result.delegationActivities.nodes.map((node) => node.id);
}
