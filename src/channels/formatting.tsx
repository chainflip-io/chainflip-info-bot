export const Bold = ({
  children,
  channel,
}: {
  children: React.ReactNode;
  channel: 'discord' | 'telegram';
}) => (channel === 'discord' ? <>**{children}**</> : <strong>{children}</strong>);

export const Link = ({
  children,
  href,
  channel,
}: {
  children: React.ReactNode;
  href: string;
  channel: 'discord' | 'telegram';
}) =>
  channel === 'discord' ? (
    <>
      [{children}]({href})
    </>
  ) : (
    <a href={href}>{children}</a>
  );
