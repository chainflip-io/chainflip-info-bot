import assert from 'assert';
import { explorerClient } from '../server.js';
import { latestDelegationActivitIdQuery } from './explorer.js';

export default async function getLatestDelegationActivityId() {
  const result = await explorerClient.request(latestDelegationActivitIdQuery);

  const delegationActivityId = result.delegationActivities?.nodes[0].id;
  assert(delegationActivityId, 'No delegation request found');

  return delegationActivityId;
}
