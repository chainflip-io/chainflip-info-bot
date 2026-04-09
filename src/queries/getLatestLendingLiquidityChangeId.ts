import { lpClient } from '../server.js';
import { getLatestLendingLiquidityChangeIdQuery } from './lp.js';

export default async function getLatestLendingLiquidityChangeId() {
  const result = await lpClient.request(getLatestLendingLiquidityChangeIdQuery);

  return result.liquidityChanges?.nodes?.at(0)?.id ?? 0;
}
