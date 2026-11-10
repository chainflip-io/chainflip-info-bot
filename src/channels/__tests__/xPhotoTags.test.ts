import { describe, expect, it } from 'vitest';
import { photoTagHandlesFor } from '../xPhotoTags.js';

describe('photoTagHandlesFor', () => {
  it('tags source asset, source chain, then destination asset and chain', () => {
    expect(photoTagHandlesFor('BscUsdt', 'Cbbtc')).toEqual([
      'tether',
      'BNBCHAIN',
      'coinbase',
      'ethereum',
    ]);
  });

  it('uses the chain for native coins', () => {
    expect(photoTagHandlesFor('Btc', 'Bnb')).toEqual(['Bitcoin', 'BNBCHAIN']);
    expect(photoTagHandlesFor('Eth', 'Sol')).toEqual(['ethereum', 'solana']);
  });

  it('dedupes repeated accounts', () => {
    expect(photoTagHandlesFor('Usdt', 'Usdc')).toEqual(['tether', 'ethereum', 'USDC']);
  });
});
