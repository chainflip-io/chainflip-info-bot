export const chainConstants = {
  Bitcoin: {
    blockTimeSeconds: 10 * 60,
  },
  Ethereum: {
    blockTimeSeconds: 12,
  },
  Solana: {
    blockTimeSeconds: 0.8,
  },
  Arbitrum: {
    blockTimeSeconds: 0.26,
  },
  Polkadot: {
    blockTimeSeconds: 6,
  },
} as const;

export type ChainflipChain = 'Bitcoin' | 'Ethereum' | 'Solana' | 'Arbitrum' | 'Polkadot';
