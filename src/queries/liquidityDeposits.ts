import { type ChainflipAsset } from '@chainflip/utils/chainflip';
import { isNotNullish } from '@chainflip/utils/guard';
import assert from 'assert';
import { explorerClient } from '../server.js';
import {
  getLatestDepositIdQuery,
  getNewDepositsQuery,
  checkHasOldDepositQuery,
} from './explorer.js';
import { toFormattedAmount } from '../utils/chainflip.js';

export const getLatestDepositId = async () => {
  const result = await explorerClient.request(getLatestDepositIdQuery);
  const depositId = result.deposits?.nodes[0].id;

  assert(depositId, 'No liquidity deposit found');

  return depositId;
};

export type NewDeposit = {
  asset: ChainflipAsset;
  depositAmount: string;
  depositValueUsd: string;
  lpIdSs58: string;
  timestamp: string;
};

export default async function checkForFirstNewLpDeposits(id: number): Promise<NewDeposit[]> {
  const { deposits: newDeposits } = await explorerClient.request(getNewDepositsQuery, { id });

  if (!newDeposits?.nodes.length) return [];

  // https://stackoverflow.com/questions/2218999/how-to-remove-all-duplicates-from-an-array-of-objects
  // keep the first deposit of each liquidity provider and filter the rest
  const uniqueLpDeposits = newDeposits.nodes.filter(
    (deposit, i) => newDeposits.nodes.findIndex((d) => d.lp.id === deposit.lp.id) === i,
  );

  const checkedDeposits = await Promise.all(
    uniqueLpDeposits.map(async (uniqueDeposit) => {
      const { deposits } = await explorerClient.request(checkHasOldDepositQuery, {
        id,
        liquidityProviderId: uniqueDeposit.lp.id,
      });

      return deposits?.nodes && deposits.nodes.length > 0
        ? undefined
        : {
            ...uniqueDeposit,
            depositAmount: toFormattedAmount(uniqueDeposit.depositAmount, uniqueDeposit.asset),
            lpIdSs58: uniqueDeposit.lp.account.idSs58,
            timestamp: uniqueDeposit.event.block.timestamp,
          };
    }),
  );

  return checkedDeposits.filter(isNotNullish);
}
