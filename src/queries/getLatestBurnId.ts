import assert from 'assert';
import { explorerClient } from '../server.js';
import { getLatestBurnQuery } from './explorer.js';

export default async function getLatestBurnId() {
  const result = await explorerClient.request(getLatestBurnQuery);

  assert(result.burns, 'Burns not found');
  assert(result.burns.nodes.length > 0, 'No burn found');

  return result.burns?.nodes[0].id;
}
