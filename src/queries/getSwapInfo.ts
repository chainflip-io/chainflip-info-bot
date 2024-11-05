import { BigNumber } from 'bignumber.js';
import { knownBrokers } from '../consts.js';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient } from '../server.js';
import { toTokenAmount } from '../utils/chainflip.js';
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
        numberOfChunks
        chunkIntervalBlocks
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
      sourceChain
      numberOfChunks
      chunkIntervalBlocks
      destinationAsset
      sourceAsset
    }
  }
`);

const getBrokerAlias = (broker: { alias?: string | null; idSs58?: string | null }) =>
  broker.alias || knownBrokers[broker.idSs58 as string].name;

const getBrokerIdAndAlias = (broker?: { alias?: string | null; idSs58?: string | null }) =>
  broker && broker.idSs58
    ? { alias: getBrokerAlias(broker) || abbreviate(broker.idSs58, 4), brokerId: broker.idSs58 }
    : { alias: 'Others' };

export default async function getSwapInfo(nativeId: string) {
  const data = await explorerClient.request(getSwapInfoByNativeIdQuery, {
    nativeId,
  });

  const { swap } = data;
  if (!swap) return null;

  const { sourceChain, sourceAsset, destinationAsset } = swap;
  const depositChannelCreationTimestamp = swap.swapChannel?.issuedBlockTimestamp;
  const depositTimestamp = swap.depositBlock?.stateChainTimestamp;
  const preDepositBlockTimestamp = swap.preDepositBlock?.stateChainTimestamp;
  const egressTimestamp = swap.egress?.scheduledEvent.block.timestamp;
  const fokMinPriceX128 = swap.swapChannel?.fokMinPriceX128;
  const timestamp = swap.completedEvent?.block.timestamp;

  const depositValueUsd = swap.depositValueUsd;
  const egressValueUsd = swap.egress?.valueUsd;
  const broker = swap.swapChannel?.broker.account;
  const numberOfChunks = swap.numberOfChunks ?? swap.swapChannel?.numberOfChunks ?? 1;
  const numberOfExecutedChunks = swap.executedSwaps.totalCount;
  const chunkIntervalBlocks = swap.chunkIntervalBlocks ?? swap.swapChannel?.chunkIntervalBlocks;

  const brokerIdAndAlias = getBrokerIdAndAlias(broker);

  const dcaChunks =
    chunkIntervalBlocks && numberOfExecutedChunks && `${numberOfExecutedChunks}/${numberOfChunks}`;

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

  const depositAmountFormatted =
    swap.depositAmount && toTokenAmount(swap.depositAmount, sourceAsset);

  const egressAmountFormatted =
    swap.egress?.amount && toTokenAmount(swap.egress?.amount, destinationAsset);

  return {
    completedEventId: swap.completedEventId,
    requestId: swap.nativeId,
    depositAmountFormatted,
    depositValueUsd,
    egressAmountFormatted,
    egressValueUsd,
    duration,
    priceDelta,
    priceDeltaPercentage,
    brokerIdAndAlias,
    dcaChunks,
    minPrice,
    sourceAsset,
    destinationAsset,
    completedAt: timestamp,
  };
}
