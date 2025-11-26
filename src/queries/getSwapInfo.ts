import { ChainflipAsset } from '@chainflip/utils/chainflip';
import { brokerAliasMap } from '@chainflip/utils/consts';
import { isNotNullish } from '@chainflip/utils/guard';
import { abbreviate } from '@chainflip/utils/string';
import { UnrecoverableError } from 'bullmq';
import { differenceInMinutes } from 'date-fns';
import env from '../env.js';
import { getSwapInfoByNativeIdQuery } from './explorer.js';
import { explorerClient } from '../server.js';
import { toAssetAmount, toUsdAmount } from '../utils/chainflip.js';
import { getPriceFromPriceX128 } from '../utils/math.js';
import { getSwapCompletionTime } from '../utils/swaps.js';

const getBrokerIdAndAlias = (broker?: { alias?: string | null; idSs58: string }) =>
  broker && broker.idSs58
    ? {
        alias: broker.alias || brokerAliasMap[broker.idSs58]?.name || abbreviate(broker.idSs58, 4),
        brokerId: broker.idSs58,
      }
    : undefined;

export default async function getSwapInfo(nativeId: `${number}`) {
  const data = await explorerClient.request(getSwapInfoByNativeIdQuery, {
    nativeId,
  });

  if (!data.swap) throw new Error('Can not find swap request');

  const { swap } = data;

  if (!swap.depositAmount) {
    throw new UnrecoverableError('Deposit amount is missing');
  }

  const { sourceChain, sourceAsset, destinationAsset, completedEventId, fokMinPriceX128 } = swap;
  const depositChannelCreationTimestamp = swap.swapChannel?.issuedBlockTimestamp;
  const depositTimestamp = swap.depositBlock?.stateChainTimestamp;
  const preDepositBlockTimestamp = swap.preDepositBlock?.stateChainTimestamp;
  const egressTimestamp = swap.egress?.scheduledEvent.block.timestamp;
  const completedAt = swap.completedEvent?.block.timestamp;

  const broker = swap.broker?.account;
  const numberOfChunks = swap.dcaNumberOfChunks;
  const numberOfExecutedChunks = swap.executedSwaps.totalCount;

  const brokerIdAndAlias = getBrokerIdAndAlias(broker);
  const affiliatesIdsAndAliases = swap.beneficiaries?.nodes
    .map(({ account }) => getBrokerIdAndAlias(account))
    .filter(isNotNullish);

  const chunkIntervalBlocks = swap.dcaChunkIntervalBlocks ?? 2;

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

  const outputAmount = toAssetAmount(
    swap.onChainInfo?.outputAmount ?? swap.egress?.amount,
    destinationAsset,
  );

  const outputValueUsd = toUsdAmount(swap.onChainInfo?.outputValueUsd ?? swap.egress?.valueUsd);

  const refundAmount = toAssetAmount(
    swap.onChainInfo?.refundAmount ?? swap.refundEgress?.amount,
    sourceAsset,
  );

  const refundValueUsd = toUsdAmount(
    swap.onChainInfo?.refundValueUsd ?? swap.refundEgress?.valueUsd,
  );

  let swapInputValueUsd = toUsdAmount(swap.depositValueUsd);
  if (refundAmount) {
    const newDepositAmount = swapInputAmount.minus(refundAmount);

    if (swapInputValueUsd) {
      const swapRatio = newDepositAmount.div(swapInputAmount);
      swapInputValueUsd = swapInputValueUsd.times(swapRatio);
    }

    swapInputAmount = newDepositAmount;
  }

  const priceDelta = outputValueUsd && swapInputValueUsd && outputValueUsd.minus(swapInputValueUsd);

  const priceDeltaPercentage =
    outputValueUsd && swapInputValueUsd
      ? outputValueUsd
          .minus(swapInputValueUsd)
          .dividedBy(swapInputValueUsd)
          .multipliedBy(100)
          .toFixed(2)
      : null;

  let freshness: 'fresh' | 'pending' | 'stale' = 'pending';

  if (completedAt) {
    freshness =
      differenceInMinutes(new Date(), Date.parse(completedAt)) <= env.SWAP_MAX_AGE_IN_MINUTES
        ? 'fresh'
        : 'stale';
  }

  return {
    completedEventId,
    requestId: swap.nativeId,
    inputAmount: toAssetAmount(swap.depositAmount, sourceAsset),
    inputValueUsd: toUsdAmount(swap.depositValueUsd),
    outputAmount,
    outputValueUsd,
    refundAmount,
    refundValueUsd,
    duration,
    priceDelta,
    priceDeltaPercentage,
    brokerIdAndAlias,
    affiliatesIdsAndAliases,
    chunkIntervalBlocks,
    dcaChunks,
    minPrice,
    sourceAsset: sourceAsset as Exclude<ChainflipAsset, 'Dot'>,
    destinationAsset: destinationAsset as Exclude<ChainflipAsset, 'Dot'>,
    completedAt,
    boostFee,
    onChainInfo: swap.onChainInfo,
    depositAddress: swap.swapChannel?.depositAddress,
    destinationAddress: swap.destinationAddress,
    freshness,
    transactionRefs: swap.transactionRefs.nodes.map(({ ref }) => ({ ref, chain: sourceChain })),
  };
}
