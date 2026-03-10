import assert from 'assert';
import { lpClient } from '../server.js';
import { getLatestLoanUpdateIdQuery } from './lp.js';

export default async function getLatestLoanUpdateId() {
  const result = await lpClient.request(getLatestLoanUpdateIdQuery);

  assert(result.updates, 'Loan updates not found');
  assert(result.updates.nodes.length > 0, 'No loan updates found');

  return result.updates.nodes[0].id;
}
