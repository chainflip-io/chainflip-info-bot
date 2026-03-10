import assert from 'assert';
import { lpClient } from '../server.js';
import { getLatestLendingLiquidityChangeIdQuery } from './lp.js';

export default async function getLatestLendingLiquidityChangeId() {
  const result = await lpClient.request(getLatestLendingLiquidityChangeIdQuery);

  assert(result.liquidityChanges, 'Lending liquidity changes not found');
  assert(result.liquidityChanges.nodes.length > 0, 'No lending liquidity changes found');

  return result.liquidityChanges.nodes[0].id;
}
