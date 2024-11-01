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
  href: string;
  platform: 'discord' | 'telegram';
}) =>
  platform === 'discord' ? (
    <>
      [{children}]({href})
    </>
  ) : (
    <a href={href}>{children}</a>
  );
