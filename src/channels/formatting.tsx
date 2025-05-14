import { unreachable } from '@chainflip/utils/assertion';
import { type ChainflipAsset, type ChainflipChain } from '@chainflip/utils/chainflip';
import type BigNumber from 'bignumber.js';
import { EXPLORER_URL } from '../consts.js';
import { humanFriendlyAsset } from '../consts.js';
import { toFormattedAmount } from '../utils/chainflip.js';
import { formatUsdValue } from '../utils/functions.js';

export const Bold = ({
  children,
  platform,
}: {
  children: React.ReactNode;
  platform: 'discord' | 'telegram' | 'twitter';
}) => {
  switch (platform) {
    case 'discord':
      return <>**{children}**</>;
    case 'telegram':
      return <strong>{children}</strong>;
    case 'twitter':
      return children;
    default:
      return unreachable(platform, 'unknown platform');
  }
};

const removeEmoji = (string: string) => string.replace(/ *[\p{S}\p{C}]/gu, '');

export const Link = ({
  children,
  href,
  platform,
  prefer = 'text',
}: {
  children: string | string[];
  href: string | URL;
  platform: 'discord' | 'telegram' | 'twitter';
  prefer?: 'text' | 'link';
}) => {
  switch (platform) {
    case 'discord':
      return (
        <>
          [{removeEmoji(Array.isArray(children) ? children.join('') : children)}
          ]({href.toString()})
        </>
      );
    case 'telegram':
      return <a href={href.toString()}>{children}</a>;
    case 'twitter':
      // twitter can't have embedded urls
      // so we either show the text
      if (prefer === 'text') return children;
      // or we show the url
      if (prefer === 'link') return href.toString();
      return unreachable(prefer, 'unknown preference');
    default:
      return unreachable(platform, 'unknown platform');
  }
};

const explorerInfo: Record<
  ChainflipChain | 'Chainflip',
  { url: string; fmt: (txId: string) => string }
> = {
  Arbitrum: { url: 'https://arbiscan.io', fmt: (ref) => `/tx/${ref}` },
  Ethereum: { url: 'https://etherscan.io', fmt: (ref) => `/tx/${ref}` },
  Solana: { url: 'https://solscan.io', fmt: (ref) => `/tx/${ref}` },
  Polkadot: { url: 'https://polkadot.subscan.io', fmt: (ref) => `/extrinsic/${ref}` },
  Bitcoin: { url: 'https://blockstream.info', fmt: (ref) => `/tx/${ref}` },
  Assethub: { url: 'https://assethub-polkadot.subscan.io', fmt: (ref) => `/extrinsic/${ref}` },
  Chainflip: { url: EXPLORER_URL, fmt: (p) => p },
};

export const ExplorerLink = ({
  children,
  path,
  platform,
  prefer,
  chain,
}: {
  children: string | string[];
  path: string;
  platform: 'discord' | 'telegram' | 'twitter';
  prefer: 'text' | 'link';
  chain?: ChainflipChain;
}) => {
  const { url, fmt } = explorerInfo[chain ?? 'Chainflip'];

  return (
    <Link platform={platform} href={new URL(fmt(path), url).toString()} prefer={prefer}>
      {children}
    </Link>
  );
};

export const Line = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    {'\n'}
  </>
);

export const Trailer = ({ platform }: { platform: 'discord' | 'telegram' | 'twitter' }) =>
  platform === 'twitter' ? '#chainflip $flip' : null;

export const UsdValue = ({ amount }: { amount: BigNumber | null }): React.JSX.Element | null => {
  if (!amount) return null;

  return <> ({formatUsdValue(amount)})</>;
};

export const TokenAmount = ({ amount, asset }: { amount: BigNumber; asset: ChainflipAsset }) => (
  <>
    {toFormattedAmount(amount)} {humanFriendlyAsset[asset]}
  </>
);
