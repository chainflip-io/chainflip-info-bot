import { describe, expect, it } from 'vitest';
import { photoTagHandlesFor } from '../xPhotoTags.js';

describe('photoTagHandlesFor', () => {
  it('tags source asset, source chain, then destination asset and chain', () => {
    expect(photoTagHandlesFor('BscUsdt', 'Cbbtc')).toEqual([
      'Tether_to',
      'BNBCHAIN',
      'coinbase',
      'ethereum',
    ]);
  });

  it('uses the chain for native coins and skips Bitcoin', () => {
    expect(photoTagHandlesFor('Btc', 'Bnb')).toEqual(['BNBCHAIN']);
    expect(photoTagHandlesFor('Eth', 'Sol')).toEqual(['ethereum', 'solana']);
  });

  it('dedupes repeated accounts', () => {
    expect(photoTagHandlesFor('Usdt', 'Usdc')).toEqual(['Tether_to', 'ethereum', 'circle']);
  });
});
