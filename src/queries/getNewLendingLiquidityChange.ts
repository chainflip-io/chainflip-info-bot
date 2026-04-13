import { lpClient } from '../server.js';
import { getNewLendingLiquidityChangeQuery } from './lp.js';
import { toAssetAmount, toUsdAmount } from '../utils/chainflip.js';

export default async function getNewLendingLiquidityChange(latestLendingLiquidityChangeId: number) {
  const result = await lpClient.request(getNewLendingLiquidityChangeQuery, {
    id: latestLendingLiquidityChangeId,
  });

  if (!result.liquidityChanges?.nodes.length) return null;

  const amount = toAssetAmount(
    result.liquidityChanges.nodes[0].amount,
    result.liquidityChanges.nodes[0].asset,
  );
  const amountValueUsd = toUsdAmount(result.liquidityChanges.nodes[0].amountUsd);

  return {
    ...result.liquidityChanges.nodes[0],
    amount,
    amountValueUsd,
  };
}
