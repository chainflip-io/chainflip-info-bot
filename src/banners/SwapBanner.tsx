import { formatDuration, formatPercentDelta, formatTokenAmount, formatUsdShort } from './format.js';
import { type Asset, BOOSTED_THEME, Pill, REGULAR_THEME, TokenIcon } from './parts.js';

export type SwapBannerProps = {
  usdValue: number;
  isBoosted: boolean;
  sourceAsset: Asset;
  destAsset: Asset;
  durationMinutes?: number;
  originalDurationMinutes?: number;
  aggregator?: string;
  oraclePriceDeltaPct: number;
  backgroundUrl: string;
  swapIconUrl: string;
  boltIconUrl?: string;
};

const TOKEN_SIZE = 60;
const CHAIN_BADGE_SIZE = 52;

export const SwapBanner = (props: SwapBannerProps) => {
  const theme = props.isBoosted ? BOOSTED_THEME : REGULAR_THEME;

  return (
    <div
      style={{
        width: 1000,
        height: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundImage: `url(${props.backgroundUrl})`,
        backgroundSize: '1000px 1000px',
        fontFamily: 'Aeonik',
        color: 'white',
      }}
    >
      {/* Top pill is now baked into the background images for tier 2 and tier 3.
          The marginTop here is the previous (top-pill marginTop 110 + pill height ~131 + gap 60)
          so the big number stays in EXACTLY the same Y-position as before. */}
      <div
        style={{
          display: 'flex',
          marginTop: 320,
          fontSize: 180,
          fontWeight: 500,
          letterSpacing: 0,
          lineHeight: 1,
        }}
      >
        {formatUsdShort(props.usdValue)}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 50,
          fontSize: 38,
          fontWeight: 500,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 28 }}>
          <div style={{ display: 'flex', marginRight: 16 }}>
            <TokenIcon asset={props.sourceAsset} size={TOKEN_SIZE} badgeSize={CHAIN_BADGE_SIZE} />
          </div>
          <span>
            {formatTokenAmount(props.sourceAsset.amount)} {props.sourceAsset.symbol}
          </span>
        </div>
        <img src={props.swapIconUrl} width={40} height={40} style={{ marginRight: 28 }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', marginRight: 16 }}>
            <TokenIcon asset={props.destAsset} size={TOKEN_SIZE} badgeSize={CHAIN_BADGE_SIZE} />
          </div>
          <span>
            {formatTokenAmount(props.destAsset.amount)} {props.destAsset.symbol}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', marginTop: 50 }}>
        {props.isBoosted && (
          <div style={{ display: 'flex', marginRight: 16 }}>
            <Pill fontSize={35} theme={theme}>
              {props.boltIconUrl && (
                <img src={props.boltIconUrl} width={40} height={40} style={{ marginRight: 6 }} />
              )}
              Boosted
            </Pill>
          </div>
        )}
        {props.durationMinutes !== undefined && (
          <div style={{ display: 'flex', marginRight: 16 }}>
            <Pill fontSize={35} theme={theme}>
              {formatDuration(props.durationMinutes)}
              {props.isBoosted && props.originalDurationMinutes !== undefined && (
                <span
                  style={{
                    display: 'flex',
                    marginLeft: 10,
                    color: 'rgba(255, 255, 255, 0.5)',
                    textDecoration: 'line-through',
                    textDecorationColor: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {formatDuration(props.originalDurationMinutes)}
                </span>
              )}
            </Pill>
          </div>
        )}
        {props.aggregator && (
          <Pill fontSize={35} theme={theme}>
            {props.aggregator}
          </Pill>
        )}
      </div>

      <div style={{ display: 'flex', marginTop: 30 }}>
        <Pill fontSize={35} theme={theme}>
          Oracle price delta: {formatPercentDelta(props.oraclePriceDeltaPct)}
        </Pill>
      </div>
    </div>
  );
};
