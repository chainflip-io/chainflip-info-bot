import { brokerAliasMap } from '@chainflip/utils/consts';
import { isNotNullish } from '@chainflip/utils/guard';
import { abbreviate } from '@chainflip/utils/string';
import { UnrecoverableError } from 'bullmq';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient } from '../server.js';
import { toAssetAmount, toUsdAmount } from '../utils/chainflip.js';
import { getPriceFromPriceX128 } from '../utils/math.js';
import { getSwapCompletionTime } from '../utils/swaps.js';

const getSwapInfoByNativeIdQuery = gql(/* GraphQL */ `
  query GetSwapInfoByNativeId($nativeId: BigInt!) {
    swap: swapRequestByNativeId(nativeId: $nativeId) {
      completedEventId
      nativeId
      depositAmount
      depositValueUsd
      sourceChain
      numberOfChunks
      destinationAsset
      sourceAsset
      effectiveBoostFeeBps
      egress: egressByEgressId {
        amount
        valueUsd
        scheduledEvent: eventByScheduledEventId {
          block: blockByBlockId {
            timestamp
          }
        }
      }
      refundEgress: egressByRefundEgressId {
        amount
        valueUsd
      }
      swapChannel: swapChannelByDepositChannelId {
        beneficiaries: swapChannelBeneficiariesByDepositChannelId(condition: { type: AFFILIATE }) {
          nodes {
            account: accountByAccountId {
              idSs58
              alias
            }
          }
        }
        broker: brokerByBrokerId {
          account: accountByAccountId {
            alias
            idSs58
          }
        }
        chunkIntervalBlocks
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
      executedSwaps: swapsBySwapRequestId(
        filter: { swapExecutedEventId: { isNull: false }, type: { in: [PRINCIPAL, SWAP] } }
      ) {
        totalCount
      }
      boostFee: swapFeesBySwapRequestId(condition: { type: BOOST }) {
        nodes {
          valueUsd
        }
      }
    }
  }
`);

const getBrokerIdAndAlias = (broker?: { alias?: string | null; idSs58: string }) =>
  broker && broker.idSs58
    ? {
        alias: broker.alias || brokerAliasMap[broker.idSs58]?.name || abbreviate(broker.idSs58, 4),
        brokerId: broker.idSs58,
      }
    : undefined;

export default async function getSwapInfo(nativeId: string) {
  const data = await explorerClient.request(getSwapInfoByNativeIdQuery, {
    nativeId,
  });

  if (!data.swap) throw new Error('Can not find swap request');

  const { swap } = data;

  if (!swap.depositAmount) {
    throw new UnrecoverableError('Deposit amount is missing');
  }

  const { sourceChain, sourceAsset, destinationAsset, completedEventId } = swap;
  const depositChannelCreationTimestamp = swap.swapChannel?.issuedBlockTimestamp;
  const depositTimestamp = swap.depositBlock?.stateChainTimestamp;
  const preDepositBlockTimestamp = swap.preDepositBlock?.stateChainTimestamp;
  const egressTimestamp = swap.egress?.scheduledEvent.block.timestamp;
  const fokMinPriceX128 = swap.swapChannel?.fokMinPriceX128;
  const completedAt = swap.completedEvent?.block.timestamp;

  const egressValueUsd = toUsdAmount(swap.egress?.valueUsd);
  const broker = swap.swapChannel?.broker.account;
  const numberOfChunks = swap.numberOfChunks ?? 1;
  const numberOfExecutedChunks = swap.executedSwaps.totalCount;

  const brokerIdAndAlias = getBrokerIdAndAlias(broker);
  const affiliatesIdsAndAliases = swap.swapChannel?.beneficiaries.nodes
    ?.map(({ account }) => getBrokerIdAndAlias(account))
    .filter(isNotNullish);

  const chunkIntervalBlocks = swap.swapChannel?.chunkIntervalBlocks ?? 2;

  const dcaChunks =
    numberOfExecutedChunks && numberOfChunks > 1
      ? `${numberOfExecutedChunks}/${numberOfChunks}`
      : undefined;

  const boostFee = toUsdAmount(
    swap.boostFee.nodes.reduce((sum, next) => sum + Number(next.valueUsd), 0),
  );

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

  const minPrice =
    fokMinPriceX128 && getPriceFromPriceX128(fokMinPriceX128, sourceAsset, destinationAsset);

  let swapInputAmount = toAssetAmount(swap.depositAmount, sourceAsset);

  const egressAmount = toAssetAmount(swap.egress?.amount, destinationAsset);

  const refundAmount = toAssetAmount(swap.refundEgress?.amount, sourceAsset);

  let swapInputValueUsd = toUsdAmount(swap.depositValueUsd);
  if (refundAmount) {
    const newDepositAmount = swapInputAmount.minus(refundAmount);

    if (swapInputValueUsd) {
      const swapRatio = newDepositAmount.div(swapInputAmount);
      swapInputValueUsd = swapInputValueUsd.times(swapRatio);
    }

    swapInputAmount = newDepositAmount;
  }

  const priceDelta = egressValueUsd && swapInputValueUsd && egressValueUsd.minus(swapInputValueUsd);

  const priceDeltaPercentage =
    egressValueUsd && swapInputValueUsd
      ? egressValueUsd
          .minus(swapInputValueUsd)
          .dividedBy(swapInputValueUsd)
          .multipliedBy(100)
          .toFixed(2)
      : null;

  return {
    completedEventId,
    requestId: swap.nativeId,
    depositAmount: toAssetAmount(swap.depositAmount, sourceAsset),
    depositValueUsd: toUsdAmount(swap.depositValueUsd),
    egressAmount,
    egressValueUsd,
    refundAmount,
    refundValueUsd: toUsdAmount(swap.refundEgress?.valueUsd),
    duration,
    priceDelta,
    priceDeltaPercentage,
    brokerIdAndAlias,
    affiliatesIdsAndAliases,
    chunkIntervalBlocks,
    dcaChunks,
    minPrice,
    sourceAsset,
    destinationAsset,
    completedAt,
    boostFee,
  };
}
