import { gql } from '../graphql/generated/gql.js';

export const getSwapInfoByNativeIdQuery = gql(`query GetSwapInfoByNativeId($nativeId: BigInt!){
swap: swapRequestByNativeId(nativeId: $nativeId){
 #if swap completed event
 completedEventId
      ##swap request id
      nativeId
      #deposit amount + USD value
      depositAmount
      depositValueUsd

      egressByEgressId {
        #egress amount + USD value
        amount
        valueUsd

        #duration - egressTimestamp
        eventByScheduledEventId {
          blockByBlockId {
            timestamp
          }
        }
      }

      swapChannelByDepositChannelId {
        #broker
        brokerByBrokerId {
          accountId
        }
        fokMinPriceX128
        #duaration - depositChannelCreationTimestamp
        issuedBlockTimestamp
      }
      #duration - preDepositBlockTimestamp
      foreignChainTrackingByForeignChainPreDepositBlockId {
        stateChainTimestamp
      }
      #duration - depositTimestamp
      foreignChainTrackingByForeignChainDepositBlockId {
        stateChainTimestamp
      }
      #duration - sourceChain
      sourceChain
      #DCA information (if applicable)
      numberOfChunks
    }
}
`);
