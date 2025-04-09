import { assetConstants } from '@chainflip/utils/chainflip';
import assert from 'assert';
import BigNumber from 'bignumber.js';
import { explorerClient } from '../server.js';
import { getNewBurnQuery } from './explorer.js';

export default async function getNewBurn(latestBurnId: number) {
  const result = await explorerClient.request(getNewBurnQuery, { id: latestBurnId });

  assert(result.burns, 'burns is required');
  if (result.burns.nodes.length === 0) {
    return null;
  }

  const node = result.burns.nodes[0];
  return {
    ...node,
    totalAmount: new BigNumber(node.totalAmount).shiftedBy(-assetConstants.Flip.decimals),
  };
}
