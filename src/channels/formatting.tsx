import { EXPLORER_URL } from '../consts.js';

export const Bold = ({
  children,
  platform,
}: {
  children: React.ReactNode;
  platform: 'discord' | 'telegram';
}) => (platform === 'discord' ? <>**{children}**</> : <strong>{children}</strong>);

export const Link = ({
  children,
  href,
  platform,
}: {
  children: React.ReactNode;
  href: string | URL;
  platform: 'discord' | 'telegram';
}) =>
  platform === 'discord' ? (
    <>
      [{children}]({href.toString()})
    </>
  ) : (
    <a href={href.toString()}>{children}</a>
  );

export const ExplorerLink = ({
  children,
  path,
  platform,
}: {
  children: React.ReactNode;
  path: string;
  platform: 'discord' | 'telegram';
}) => (
  <Link platform={platform} href={new URL(path, EXPLORER_URL)}>
    {children}
  </Link>
);
