import { unreachable } from '@chainflip/utils/assertion';
import { formatUsdValue } from '@chainflip/utils/number';
import { type BigNumber } from 'bignumber.js';
import { EXPLORER_URL } from '../consts.js';
import { humanFriendlyAsset } from '../consts.js';
import { type ChainflipAsset } from '../graphql/generated/graphql.js';
import { toFormattedAmount } from '../utils/chainflip.js';

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

export const Link = ({
  children,
  href,
  platform,
  prefer = 'text',
}: {
  children: React.ReactNode;
  href: string | URL;
  platform: 'discord' | 'telegram' | 'twitter';
  prefer?: 'text' | 'link';
}) => {
  switch (platform) {
    case 'discord':
      return (
        <>
          [{children}]({href.toString()})
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

export const ExplorerLink = ({
  children,
  path,
  platform,
  prefer,
}: {
  children: React.ReactNode;
  path: string;
  platform: 'discord' | 'telegram' | 'twitter';
  prefer: 'text' | 'link';
}) => (
  <Link platform={platform} href={new URL(path, EXPLORER_URL)} prefer={prefer}>
    {children}
  </Link>
);

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
