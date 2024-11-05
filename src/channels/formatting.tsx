import { EXPLORER_URL } from '../consts.js';
import { unreachable } from '../utils/guards.js';

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
      return unreachable(platform, 'unknown step');
  }
};

export const Link = ({
  children,
  href,
  platform,
}: {
  children: React.ReactNode;
  href: string | URL;
  platform: 'discord' | 'telegram' | 'twitter';
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
      return children;
    default:
      return unreachable(platform, 'unknown step');
  }
};

export const ExplorerLink = ({
  children,
  path,
  platform,
}: {
  children: React.ReactNode;
  path: string;
  platform: 'discord' | 'telegram' | 'twitter';
}) => (
  <Link platform={platform} href={new URL(path, EXPLORER_URL)}>
    {children}
  </Link>
);
