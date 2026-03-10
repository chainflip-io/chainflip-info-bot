import { lpClient } from '../server.js';
import { getNewLoanUpdateQuery } from './lp.js';
import { toAssetAmount, toUsdAmount } from '../utils/chainflip.js';
import { unrecoverableAssert } from '../utils/functions.js';

export default async function getNewLoanUpdate(latestLoanUpdateId: number) {
  const result = await lpClient.request(getNewLoanUpdateQuery, { id: latestLoanUpdateId });

  if (!result.updates?.nodes.length) return null;

  unrecoverableAssert(
    result.updates.nodes[0].loanByLoanId.asset !== 'Dot',
    'Loan asset should not be Dot',
  );

  const amount = toAssetAmount(
    result.updates.nodes[0].amount,
    result.updates.nodes[0].loanByLoanId.asset,
  );
  const amountValueUsd = toUsdAmount(result.updates.nodes[0].amountValueUsd);

  return {
    ...result.updates.nodes[0],
    amount,
    amountValueUsd,
  };
}
