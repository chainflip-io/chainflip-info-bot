import { isNotNullish } from '@chainflip/utils/guard';
import assert from 'assert';
import { lpClient } from '../server.js';
import { getLiquidationStatusByLoanIdsQuery } from './lp.js';

export default async function getLiquidationStatus(loanIds: `${number}`[]) {
  const result = await lpClient.request(getLiquidationStatusByLoanIdsQuery, {
    loanIds,
  });

  assert(result.requests, 'Liquidation swap requests are required');
  if (!result.requests.nodes.length) return null;

  return result.requests.nodes.map((node) => ({
    ...node,
    isCompleted: isNotNullish(node.completedAtEventId) || isNotNullish(node.abortedAtEventId),
  }));
}
