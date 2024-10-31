import { BigNumber } from 'bignumber.js';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient } from '../server.js';
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
      sourceChain
      numberOfChunks
      destinationAsset
      sourceAsset
    }
  }
`);

const brokerIdSS58ToAliasMap: Record<string, string> = {
  cFLRQDfEdmnv6d2XfHJNRBQHi4fruPMReLSfvB8WWD2ENbqj7: 'Chainflip Swapping',
  cFJWWedhJmnsk3P9jEmCfbmgmg62ZpA7LT5WCpwLXEzXuRuc3: 'Houdini Swap',
  cFKYhAZR1ycHnXLC1PVttiAMVRK489rKhfRXPA4v9yG4WdzqP: 'El Dorado',
  cFN1AfNQBEBCkuNAV37WWw34bCAdiW5e5sHTY4LaaRWiBSh7B: 'Thunderhead',
  cFLuWQcabsKpegned1ka3Qad6cTATzpgwLYZK8U5spmkG9MEf: 'THORWallet',
  cFJjZKzA5rUTb9qkZMGfec7piCpiAQKr15B4nALzriMGQL8BE: 'THORSwap',
};

const getBrokerAlias = (broker: { alias?: string | null; idSs58?: string | null }) =>
  broker.alias || brokerIdSS58ToAliasMap[broker.idSs58 as string];

const getBrokerIdOrAlias = (broker?: { alias?: string | null; idSs58?: string | null }) =>
  broker && broker.idSs58 ? getBrokerAlias(broker) || abbreviate(broker.idSs58, 4) : 'Others';

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
  const alias = getBrokerIdOrAlias(broker);

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

  const priceDelta = egressValueUsd
    ? new BigNumber(Number(egressValueUsd).toFixed())
        .minus(Number(depositValueUsd))
        .dividedBy(Number(depositValueUsd))
        .multipliedBy(100)
    : null;

  const minPrice =
    fokMinPriceX128 && getPriceFromPriceX128(fokMinPriceX128, sourceAsset, destinationAsset);

  return {
    completedEventId: swap.completedEventId,
    requestId: swap.nativeId,
    depositAmount: swap.depositAmount,
    depositValueUsd,
    egressAmount: swap.egress?.amount,
    egressValueUsd,
    duration,
    priceDelta,
    alias,
    dcaChunks: swap.numberOfChunks,
    minPrice,
    sourceAsset,
    destinationAsset,
    executedAt: timestamp,
  };
}
