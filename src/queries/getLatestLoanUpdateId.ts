import { lpClient } from '../server.js';
import { getLatestLoanUpdateIdQuery } from './lp.js';

export default async function getLatestLoanUpdateId() {
  const result = await lpClient.request(getLatestLoanUpdateIdQuery);

  return result.updates?.nodes?.at(0)?.id ?? 0;
}
