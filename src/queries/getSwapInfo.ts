import { BigNumber } from 'bignumber.js';
import request from 'graphql-request';
import env from '../env.js';
import { gql } from '../graphql/generated/gql.js';
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
        eventByScheduledEventId {
          blockByBlockId {
            timestamp
          }
        }
      }
      swapChannel: swapChannelByDepositChannelId {
        broker: brokerByBrokerId {
          accountByAccountId {
            alias
            idSs58
          }
        }
        fokMinPriceX128
        issuedBlockTimestamp
      }
      foreignChainTrackingByForeignChainPreDepositBlockId {
        stateChainTimestamp
      }
      foreignChainTrackingByForeignChainDepositBlockId {
        stateChainTimestamp
      }
      sourceChain
      numberOfChunks
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

const getBrokerAlias = (broker?: { alias?: string | null; idSs58?: string | null }) =>
  broker?.alias || brokerIdSS58ToAliasMap[broker?.idSs58 as string];

const getBrokerIdOrAlias = (broker?: { alias?: string | null; idSs58?: string | null }) =>
  broker && broker.idSs58 ? getBrokerAlias(broker) || abbreviate(broker.idSs58, 4) : 'Others';

export default async function getSwapInfo(nativeId: string) {
  const data = await request(env.EXPLORER_GATEWAY_URL, getSwapInfoByNativeIdQuery, {
    nativeId,
  });

  const { swap } = data;
  if (!swap) return null;

  const { sourceChain } = swap;
  const depositChannelCreationTimestamp = swap.swapChannel?.issuedBlockTimestamp;
  const depositTimestamp =
    swap.foreignChainTrackingByForeignChainDepositBlockId?.stateChainTimestamp;
  const preDepositBlockTimestamp =
    swap.foreignChainTrackingByForeignChainPreDepositBlockId?.stateChainTimestamp;
  const egressTimestamp = swap.egress?.eventByScheduledEventId.blockByBlockId.timestamp;

  const depositValueUsd = swap.depositValueUsd;
  const egressValueUsd = swap.egress?.valueUsd;
  const broker = swap.swapChannel?.broker.accountByAccountId;
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

  const priceDelta =
    egressValueUsd && depositTimestamp
      ? new BigNumber(Number(egressValueUsd).toFixed())
          .minus(Number(depositValueUsd))
          .dividedBy(Number(depositValueUsd))
          .multipliedBy(100)
      : null;

  return {
    compeletedEventId: swap.completedEventId,
    requestId: swap.nativeId,
    depositAmount: swap.depositAmount,
    depositValueUsd,
    egressAmount: swap.egress?.amount,
    egressValueUsd,
    duration,
    priceDelta,
    alias,
    dca: swap.numberOfChunks,
    fok: swap.swapChannel?.fokMinPriceX128,
  };
}
