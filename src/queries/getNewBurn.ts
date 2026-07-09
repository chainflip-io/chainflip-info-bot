import { assetConstants } from '@chainflip/utils/chainflip';
import assert from 'assert';
import { explorerClient } from '../server.js';
import { getNewBurnQuery } from './explorer.js';
import { toBigNumberOrNull } from '../utils/chainflip.js';

export default async function getNewBurn(latestBurnId: number) {
  const result = await explorerClient.request(getNewBurnQuery, { id: latestBurnId });

  assert(result.burns, 'burns is required');
  if (result.burns.nodes.length === 0) {
    return null;
  }

  const node = result.burns.nodes[0];
  const totalAmount = toBigNumberOrNull(node.totalAmount);

  return totalAmount
    ? {
        ...node,
        totalAmount: totalAmount.shiftedBy(-assetConstants.Flip.decimals),
      }
    : null;
}
