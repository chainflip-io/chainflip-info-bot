import { BigNumber } from 'bignumber.js';
import { knownBrokers } from '../consts.js';
import { gql } from '../graphql/generated/gql.js';
import { GetSwapInfoByNativeIdQuery, SwapFeeType } from '../graphql/generated/graphql.js';
import { explorerClient } from '../server.js';
import { toFormattedAmount } from '../utils/chainflip.js';
import { getPriceFromPriceX128 } from '../utils/math.js';
import { abbreviate } from '../utils/strings.js';
import { getSwapCompletionTime } from '../utils/swaps.js';

const getSwapInfoByNativeIdQuery = gql(/* GraphQL */ `
  query GetSwapInfoByNativeId($nativeId: BigInt!) {
    swap: swapRequestByNativeId(nativeId: $nativeId) {
      completedEventId
      nativeId
      depositAmount
      depositValueUsd
      egress: egressByEgressId {
        amount
        valueUsd
        scheduledEvent: eventByScheduledEventId {
          block: blockByBlockId {
            timestamp
          }
        }
      }
      swapChannel: swapChannelByDepositChannelId {
        broker: brokerByBrokerId {
          account: accountByAccountId {
            alias
            idSs58
          }
        }
        fokMinPriceX128
        issuedBlockTimestamp
      }
      preDepositBlock: foreignChainTrackingByForeignChainPreDepositBlockId {
        stateChainTimestamp
      }
      depositBlock: foreignChainTrackingByForeignChainDepositBlockId {
        stateChainTimestamp
      }
      completedEvent: eventByCompletedEventId {
        block: blockByBlockId {
          timestamp
        }
      }
      executedSwaps: swapsBySwapRequestId(filter: { swapExecutedEventId: { isNull: false } }) {
        totalCount
      }
      fees: swapFeesBySwapRequestId {
        nodes {
          valueUsd
          amount
          asset
          type
        }
      }
      sourceChain
      numberOfChunks
      destinationAsset
      sourceAsset
      effectiveBoostFeeBps
    }
  }
`);

type Fee = NonNullable<GetSwapInfoByNativeIdQuery['swap']>['fees']['nodes'][number];

const getBrokerAlias = (broker: { alias?: string | null; idSs58: string }) =>
  broker.alias || knownBrokers[broker.idSs58]?.name || undefined;

const getBrokerIdAndAlias = (broker?: { alias?: string | null; idSs58: string }) =>
  broker && broker.idSs58
    ? { alias: getBrokerAlias(broker) || abbreviate(broker.idSs58, 4), brokerId: broker.idSs58 }
    : undefined;

const getFee = (fees: Fee[], feeType: SwapFeeType) => {
  const fee = fees.find(({ type }) => type === feeType);

  return (
    fee && {
      valueUsd: Number(fee.valueUsd ?? 0),
    }
  );
};

export default async function getSwapInfo(nativeId: string) {
  const data = await explorerClient.request(getSwapInfoByNativeIdQuery, {
    nativeId,
  });

  if (!data || !data.swap) throw new Error('Can not find swap request');

  const { swap } = data;
  const { sourceChain, sourceAsset, destinationAsset, completedEventId, effectiveBoostFeeBps } =
    swap;
  const depositChannelCreationTimestamp = swap.swapChannel?.issuedBlockTimestamp;
  const depositTimestamp = swap.depositBlock?.stateChainTimestamp;
  const preDepositBlockTimestamp = swap.preDepositBlock?.stateChainTimestamp;
  const egressTimestamp = swap.egress?.scheduledEvent.block.timestamp;
  const fokMinPriceX128 = swap.swapChannel?.fokMinPriceX128;
  const completedAt = swap.completedEvent?.block.timestamp;

  const depositValueUsd = swap.depositValueUsd;
  const egressValueUsd = swap.egress?.valueUsd;
  const broker = swap.swapChannel?.broker.account;
  const numberOfChunks = swap.numberOfChunks ?? 1;
  const numberOfExecutedChunks = swap.executedSwaps.totalCount;

  const brokerIdAndAlias = getBrokerIdAndAlias(broker);

  const dcaChunks =
    numberOfExecutedChunks && numberOfChunks > 1
      ? `${numberOfExecutedChunks}/${numberOfChunks}`
      : undefined;

  const boostFee = getFee(swap.fees.nodes, 'BOOST');

  let duration;
  if (depositTimestamp && egressTimestamp) {
    duration = getSwapCompletionTime({
      sourceChain,
      depositChannelCreationTimestamp: depositChannelCreationTimestamp
        ? new Date(depositChannelCreationTimestamp)
        : undefined,
      depositTimestamp: new Date(depositTimestamp),
      preDepositBlockTimestamp: preDepositBlockTimestamp
        ? new Date(preDepositBlockTimestamp)
        : undefined,
      egressTimestamp: new Date(egressTimestamp),
      exact: false,
    });
  }

  const priceDelta =
    egressValueUsd && depositValueUsd && Number(egressValueUsd) - Number(depositValueUsd);

  const priceDeltaPercentage = egressValueUsd
    ? new BigNumber(Number(egressValueUsd).toFixed())
        .minus(Number(depositValueUsd))
        .dividedBy(Number(depositValueUsd))
        .multipliedBy(100)
        .toFixed(2)
    : null;

  const minPrice =
    fokMinPriceX128 && getPriceFromPriceX128(fokMinPriceX128, sourceAsset, destinationAsset);

  const depositAmount = swap.depositAmount && toFormattedAmount(swap.depositAmount, sourceAsset);

  const egressAmount =
    swap.egress?.amount && toFormattedAmount(swap.egress?.amount, destinationAsset);

  return {
    completedEventId,
    requestId: swap.nativeId,
    depositAmount,
    depositValueUsd,
    egressAmount,
    egressValueUsd,
    duration,
    priceDelta,
    priceDeltaPercentage,
    brokerIdAndAlias,
    dcaChunks,
    minPrice,
    sourceAsset,
    destinationAsset,
    completedAt,
    boostFee,
    effectiveBoostFeeBps,
  };
}
