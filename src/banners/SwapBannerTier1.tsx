import { formatDuration, formatPercentDelta, formatTokenAmount, formatUsdShort } from './format.js';
import {
  type Asset,
  BOOSTED_THEME,
  Pill,
  REGULAR_THEME,
  TokenIcon,
} from './parts.js';

export type SwapBannerTier1Props = {
  usdValue: number;
  isBoosted: boolean;
  sourceAsset: Asset;
  destAsset: Asset;
  durationMinutes?: number;
  originalDurationMinutes?: number;
  aggregator?: string;
  marketPriceDeltaPct: number;
  backgroundUrl: string;
  boltIconUrl?: string;
  smallSourceIconUrl: string;
  smallDestIconUrl: string;
  swapIconUrl: string;
};

const LARGE_TOKEN_SIZE = 197;
// Match small token's badge ratio (~87%): 197 * 0.87 ≈ 170
const LARGE_BADGE_SIZE = 170;
const SMALL_TOKEN_SIZE = 48;

export const SwapBannerTier1 = (props: SwapBannerTier1Props) => {
  const theme = props.isBoosted ? BOOSTED_THEME : REGULAR_THEME;

  return (
    <div
      style={{
        width: 1000,
        height: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        backgroundImage: `url(${props.backgroundUrl})`,
        backgroundSize: '1000px 1000px',
        fontFamily: 'Aeonik',
        color: 'white',
      }}
    >
      {/* Source token at curve start (no chain badge — shown only on small icons below) */}
      <div style={{ display: 'flex', position: 'absolute', left: 210, top: 200 }}>
        <TokenIcon
          asset={{ ...props.sourceAsset, chainBadgeUrl: undefined }}
          size={LARGE_TOKEN_SIZE}
          badgeSize={LARGE_BADGE_SIZE}
        />
      </div>
      {/* Destination token at curve end (no chain badge) */}
      <div style={{ display: 'flex', position: 'absolute', left: 612, top: 200 }}>
        <TokenIcon
          asset={{ ...props.destAsset, chainBadgeUrl: undefined }}
          size={LARGE_TOKEN_SIZE}
          badgeSize={LARGE_BADGE_SIZE}
        />
      </div>

      {/* Big USD value */}
      <div
        style={{
          display: 'flex',
          marginTop: 480,
          fontSize: 144,
          fontWeight: 500,
          letterSpacing: 0,
          lineHeight: 1,
        }}
      >
        {formatUsdShort(props.usdValue)}
      </div>

      {/* Token amounts row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 40,
          fontSize: 36,
          fontWeight: 500,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 24 }}>
          <div style={{ display: 'flex', marginRight: 14 }}>
            <TokenIcon
              asset={{ ...props.sourceAsset, iconUrl: props.smallSourceIconUrl }}
              size={SMALL_TOKEN_SIZE}
              badgeSize={42}
              badgeOffset={{ bottom: -6, right: -8 }}
            />
          </div>
          <span>
            {formatTokenAmount(props.sourceAsset.amount)} {props.sourceAsset.symbol}
          </span>
        </div>
        <img src={props.swapIconUrl} width={36} height={36} style={{ marginRight: 24 }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', marginRight: 14 }}>
            <TokenIcon
              asset={{ ...props.destAsset, iconUrl: props.smallDestIconUrl }}
              size={SMALL_TOKEN_SIZE}
              badgeSize={42}
              badgeOffset={{ bottom: -6, right: -8 }}
            />
          </div>
          <span>
            {formatTokenAmount(props.destAsset.amount)} {props.destAsset.symbol}
          </span>
        </div>
      </div>

      {/* Time + Boosted + aggregator pills */}
      <div style={{ display: 'flex', marginTop: 40 }}>
        {props.isBoosted && (
          <div style={{ display: 'flex', marginRight: 16 }}>
            <Pill fontSize={32} theme={theme}>
              {props.boltIconUrl && (
                <img
                  src={props.boltIconUrl}
                  width={36}
                  height={36}
                  style={{ marginRight: 6 }}
                />
              )}
              Boosted
            </Pill>
          </div>
        )}
        {props.durationMinutes !== undefined && (
          <div style={{ display: 'flex', marginRight: 16 }}>
            <Pill fontSize={32} theme={theme}>
              {formatDuration(props.durationMinutes)}
              {props.originalDurationMinutes !== undefined && (
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
          <Pill fontSize={32} theme={theme}>
            {props.aggregator}
          </Pill>
        )}
      </div>

      {/* Market price delta */}
      <div style={{ display: 'flex', marginTop: 24 }}>
        <Pill fontSize={32} theme={theme}>
          Market price delta: {formatPercentDelta(props.marketPriceDeltaPct)}
        </Pill>
      </div>
    </div>
  );
};
