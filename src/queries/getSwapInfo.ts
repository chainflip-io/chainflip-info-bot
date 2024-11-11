import { isNotNullish } from '@chainflip/utils/guard';
import { UnrecoverableError } from 'bullmq';
import { knownBrokers } from '../consts.js';
import { gql } from '../graphql/generated/gql.js';
import { ChainflipAsset, SwapFeeType } from '../graphql/generated/graphql.js';
import { explorerClient } from '../server.js';
import { toAssetAmount, toUsdAmount } from '../utils/chainflip.js';
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
    }
  }
`);

type Fee = {
  __typename?: 'SwapFee';
  valueUsd?: string | null;
  amount: string;
  asset: ChainflipAsset;
  type: SwapFeeType;
};

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
      valueUsd: toUsdAmount(fee.valueUsd),
    }
  );
};

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

  const minPrice =
    fokMinPriceX128 && getPriceFromPriceX128(fokMinPriceX128, sourceAsset, destinationAsset);

  let depositAmount = toAssetAmount(swap.depositAmount, sourceAsset);

  const egressAmount = toAssetAmount(swap.egress?.amount, destinationAsset);

  const refundAmount = toAssetAmount(swap.refundEgress?.amount, sourceAsset);

  let depositValueUsd = toUsdAmount(swap.depositValueUsd);
  if (refundAmount) {
    const newDepositAmount = depositAmount.minus(refundAmount);

    if (depositValueUsd) {
      const swapRatio = newDepositAmount.div(depositAmount);
      depositValueUsd = depositValueUsd.times(swapRatio);
    }

    depositAmount = newDepositAmount;
  }

  const priceDelta =
    egressValueUsd && depositValueUsd && Number(egressValueUsd) - Number(depositValueUsd);

  const priceDeltaPercentage =
    egressValueUsd && depositValueUsd
      ? egressValueUsd
          .minus(depositValueUsd)
          .dividedBy(depositValueUsd)
          .multipliedBy(100)
          .toFixed(2)
      : null;

  return {
    completedEventId,
    requestId: swap.nativeId,
    originalDepositAmount: toAssetAmount(swap.depositAmount, sourceAsset),
    originalDepositValueUsd: swap.depositValueUsd,
    depositAmount,
    depositValueUsd,
    egressAmount,
    egressValueUsd,
    refundAmount,
    refundValueUsd: toUsdAmount(swap.refundEgress?.valueUsd),
    duration,
    priceDelta,
    priceDeltaPercentage,
    brokerIdAndAlias,
    affiliatesIdsAndAliases,
    dcaChunks,
    minPrice,
    sourceAsset,
    destinationAsset,
    completedAt,
    boostFee,
  };
}
