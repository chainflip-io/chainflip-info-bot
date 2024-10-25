import { gql } from '../graphql/generated/gql.js';

export const getSwapInfoByNativeIdQuery = gql(/* GraphQL */ `
  query GetSwapInfoByNativeId($nativeId: BigInt!) {
    swap: swapRequestByNativeId(nativeId: $nativeId) {
      completedEventId
      nativeId
      depositAmount
      depositValueUsd
      egressByEgressId {
        amount
        valueUsd
        eventByScheduledEventId {
          blockByBlockId {
            timestamp
          }
        }
      }
      swapChannelByDepositChannelId {
        brokerByBrokerId {
          accountId
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
