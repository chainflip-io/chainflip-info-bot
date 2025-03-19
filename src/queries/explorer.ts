import { gql } from '../graphql/generated/explorer/gql.js';

export const getSwapVolumeStatsQuery = gql(/* GraphQL */ `
  query GetSwapVolumeStats($start: Datetime!, $end: Datetime!) {
    swaps: allSwaps(
      filter: {
        swapExecutedBlockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end }
      }
    ) {
      aggregates {
        sum {
          intermediateValueUsd
          swapOutputValueUsd
        }
      }
      nodes {
        fees: swapFeesBySwapId(condition: { type: NETWORK }) {
          nodes {
            valueUsd
          }
        }
      }
    }
    boostedSwapRequests: allSwapRequests(
      filter: {
        completedBlockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end }
        effectiveBoostFeeBps: { isNull: false }
      }
    ) {
      nodes {
        networkFeeSplit: boostNetworkFeeSplitByBoostedSwapRequestId {
          valueUsd
        }
        fees: swapFeesBySwapRequestId(condition: { type: BOOST }) {
          nodes {
            valueUsd
          }
        }
      }
    }
    burns: allBurns(
      filter: { timestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }
    ) {
      nodes {
        totalAmount
      }
    }
  }
`);

export const getLatestBurnQuery = gql(/* GraphQL */ `
  query getLatestBurn {
    burns: allBurns(first: 1, orderBy: ID_DESC) {
      nodes {
        id
      }
    }
  }
`);

export const latestSwapRequestIdQuery = gql(/* GraphQL */ `
  query LatestSwapRequest {
    swapRequests: allSwapRequests(first: 1, orderBy: NATIVE_ID_DESC) {
      nodes {
        nativeId
      }
    }
  }
`);

export const getNewBurnQuery = gql(/* GraphQL */ `
  query getNewBurn($id: Int!) {
    burns: allBurns(filter: { id: { greaterThan: $id } }, orderBy: ID_DESC, first: 1) {
      nodes {
        id
        totalAmount
        valueUsd
        event: eventByEventId {
          blockId
          indexInBlock
          block: blockByBlockId {
            timestamp
          }
        }
      }
    }
  }
`);

export const getNewSwapRequestsQuery = gql(/* GraphQL */ `
  query GetNewSwapRequestsQuery($nativeId: BigInt!) {
    swapRequests: allSwapRequests(
      filter: { nativeId: { greaterThan: $nativeId }, type: { in: [REGULAR, LEGACY_CCM] } }
    ) {
      nodes {
        nativeId
      }
    }
  }
`);

export const getSwapInfoByNativeIdQuery = gql(/* GraphQL */ `
  query GetSwapInfoByNativeId($nativeId: BigInt!) {
    swap: swapRequestByNativeId(nativeId: $nativeId) {
      completedEventId
      nativeId
      depositAmount
      depositValueUsd
      sourceChain
      fokMinPriceX128
      dcaNumberOfChunks
      dcaChunkIntervalBlocks
      destinationAsset
      destinationAddress
      sourceAsset
      effectiveBoostFeeBps
      broker: brokerByBrokerId {
        account: accountByAccountId {
          alias
          idSs58
        }
      }
      beneficiaries: swapRequestBeneficiariesBySwapRequestId(condition: { type: AFFILIATE }) {
        nodes {
          account: accountByAccountId {
            idSs58
            alias
          }
        }
      }
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
        issuedBlockTimestamp
        depositAddress
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
      transactionRefs: transactionRefsBySwapRequestId {
        nodes {
          ref
        }
      }
    }
  }
`);

export const getNewDepositsQuery = gql(/* GraphQL */ `
  query GetNewLiquididityDeposits($id: Int!) {
    deposits: allLiquidityDeposits(filter: { id: { greaterThan: $id } }, orderBy: ID_ASC) {
      nodes {
        asset
        depositAmount
        depositValueUsd
        lp: liquidityProviderByLiquidityProviderId {
          id
          account: accountByAccountId {
            idSs58
          }
        }
        event: eventByEventId {
          block: blockByBlockId {
            timestamp
          }
        }
      }
    }
  }
`);

export const checkHasOldDepositQuery = gql(/* GraphQL */ `
  query CheckHasOldDeposit($id: Int!, $liquidityProviderId: Int!) {
    deposits: allLiquidityDeposits(
      filter: { id: { lessThan: $id }, liquidityProviderId: { equalTo: $liquidityProviderId } }
      first: 1
    ) {
      nodes {
        id
        liquidityProviderId
      }
    }
  }
`);

export const getLatestDepositIdQuery = gql(/* GraphQL */ `
  query GetLatestDepositId {
    deposits: allLiquidityDeposits(first: 1, orderBy: ID_DESC) {
      nodes {
        id
      }
    }
  }
`);
