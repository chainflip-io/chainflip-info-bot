import { assetConstants } from '@chainflip/utils/chainflip';
import BigNumber from 'bignumber.js';
import { explorerClient } from '../server.js';
import { getSwapVolumeStatsQuery } from './explorer.js';

export type SwapStats = {
  swapVolume: BigNumber;
  networkFees: BigNumber;
  totalFlipBurned: BigNumber | null;
  boostFees: BigNumber;
};

export default async function getSwapVolumeStats(start: Date, end: Date): Promise<SwapStats> {
  const args = { start: start.toISOString(), end: end.toISOString() };

  const swapInfo = await explorerClient.request(getSwapVolumeStatsQuery, args);

  const swapVolume = BigNumber.sum(
    swapInfo.swaps?.aggregates?.sum?.intermediateValueUsd ?? 0,
    swapInfo.swaps?.aggregates?.sum?.swapOutputValueUsd ?? 0,
  );

  let networkFees = (swapInfo.swaps?.nodes ?? []).reduce(
    (total, swap) => swap.fees.nodes.reduce((acc, fee) => acc.plus(fee.valueUsd ?? 0), total),
    new BigNumber(0),
  );

  let boostFees = new BigNumber(0);

  for (const req of swapInfo.boostedSwapRequests?.nodes ?? []) {
    boostFees = req.fees.nodes.reduce((acc, fee) => acc.plus(fee.valueUsd ?? 0), boostFees);
    networkFees = networkFees.plus(req.networkFeeSplit?.valueUsd ?? 0);
  }

  const totalFlipBurned = BigNumber.sum(
    0,
    ...(swapInfo.burns?.nodes ?? []).map((burn) => burn.totalAmount),
  ).shiftedBy(-assetConstants.Flip.decimals);

  return {
    swapVolume,
    networkFees,
    totalFlipBurned: totalFlipBurned.gt(0) ? totalFlipBurned : null,
    boostFees,
  };
}
