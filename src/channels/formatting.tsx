export const Bold = ({
  children,
  channel,
}: {
  children: React.ReactNode;
  channel: 'discord' | 'telegram';
}) => (channel === 'discord' ? <>**{children}**</> : <strong>{children}</strong>);
