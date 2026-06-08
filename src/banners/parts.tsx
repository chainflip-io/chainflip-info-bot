export type Asset = {
  iconUrl: string;
  symbol: string;
  amount: number;
  chainBadgeUrl?: string;
};

export type Theme = {
  solidFill: string;
  solidStroke: string;
  solidTextColor: string;
  outlineGradientStart: string;
  outlineStroke: string;
  outlineStrokeWidth: number;
};

export const REGULAR_THEME: Theme = {
  solidFill: '#A8FFD5',
  solidStroke: '#46DA93',
  solidTextColor: '#000000',
  outlineGradientStart: 'rgba(168, 255, 213, 0.1)',
  outlineStroke: 'rgba(168, 255, 213, 0.1)',
  outlineStrokeWidth: 3,
};

export const BOOSTED_THEME: Theme = {
  solidFill: 'rgba(255, 155, 214, 0.18)',
  solidStroke: 'linear-gradient(90deg, rgba(255, 155, 214, 0.3), rgba(255, 255, 255, 0.3))',
  solidTextColor: '#FFFFFF',
  outlineGradientStart: 'rgba(255, 155, 214, 0.1)',
  outlineStroke: 'rgba(255, 155, 214, 0.3)',
  outlineStrokeWidth: 3.47,
};

const isGradient = (color: string) => color.includes('gradient');

export const Pill = ({
  children,
  variant = 'outline',
  fontSize = 28,
  paddingX = 24,
  paddingY = 10,
  borderRadius = 999,
  theme,
}: {
  children: React.ReactNode;
  variant?: 'outline' | 'solid';
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
  borderRadius?: number;
  theme: Theme;
}) => {
  const fill =
    variant === 'solid'
      ? theme.solidFill
      : `linear-gradient(180deg, ${theme.outlineGradientStart}, rgba(255, 255, 255, 0.1))`;
  const stroke = variant === 'solid' ? theme.solidStroke : theme.outlineStroke;
  const strokeWidth = variant === 'solid' ? 3.47 : theme.outlineStrokeWidth;

  const inner = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${paddingY}px ${paddingX}px`,
        borderRadius: isGradient(stroke) ? borderRadius - strokeWidth : borderRadius,
        background: fill,
        border: isGradient(stroke) ? 'none' : `${strokeWidth}px solid ${stroke}`,
        color: variant === 'solid' ? theme.solidTextColor : 'white',
        fontSize,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );

  if (isGradient(stroke)) {
    return (
      <div
        style={{
          display: 'flex',
          padding: strokeWidth,
          borderRadius,
          background: stroke,
        }}
      >
        {inner}
      </div>
    );
  }

  return inner;
};

export const TokenIcon = ({
  asset,
  size,
  badgeSize,
  badgeOffset = { bottom: -8, right: -10 },
}: {
  asset: Asset;
  size: number;
  badgeSize: number;
  badgeOffset?: { bottom: number; right: number };
}) => (
  <div style={{ display: 'flex', position: 'relative', width: size, height: size }}>
    <img src={asset.iconUrl} width={size} height={size} />
    {asset.chainBadgeUrl && (
      <img
        src={asset.chainBadgeUrl}
        width={badgeSize}
        height={badgeSize}
        style={{ position: 'absolute', bottom: badgeOffset.bottom, right: badgeOffset.right }}
      />
    )}
  </div>
);
