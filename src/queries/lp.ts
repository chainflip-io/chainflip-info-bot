import { gql } from '../graphql/generated/lp/gql.js';

export const getBoostSummaryQuery = gql(/* GraphQL */ `
  query GetBoostSummary($start: Datetime!, $end: Datetime!, $asset: ChainflipAsset!) {
    boostPools: allBoostPools(filter: { asset: { equalTo: $asset } }) {
      nodes {
        asset
        feeTierPips
        boostShares: boostSharesByBoostPoolId(
          filter: {
            executedAtTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end }
            lost: { equalTo: false }
          }
        ) {
          aggregates {
            sum {
              fee
              feeUsd
              amount
              amountUsd
            }
          }
        }
        apys: boostPoolApiesByBoostPoolId(orderBy: BLOCK_DESC, first: 1) {
          nodes {
            projectedApy
          }
        }
      }
    }
  }
`);

export const getLpFillsQuery = gql(/* GraphQL */ `
  query GetLpFills($start: Datetime!, $end: Datetime!) {
    limitOrders: allLimitOrderFills(
      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }
    ) {
      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {
        keys
        sum {
          filledAmountValueUsd
        }
      }
    }
    rangeOrders: allRangeOrderFills(
      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }
    ) {
      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {
        keys
        sum {
          baseFilledAmountValueUsd
          quoteFilledAmountValueUsd
        }
      }
    }
  }
`);

export const getIdSs58Query = gql(/* GraphQL */ `
  query GetAccount($ids: [Int!]) {
    accounts: allAccounts(filter: { id: { in: $ids } }) {
      nodes {
        id
        type
        idSs58
      }
    }
  }
`);

export const getLatestLoanUpdateIdQuery = gql(/* GraphQL */ `
  query GetLatestLoanUpdateId {
    updates: allLoanUpdates(first: 1, orderBy: ID_DESC) {
      nodes {
        id
      }
    }
  }
`);

export const getNewLoanUpdateQuery = gql(/* GraphQL */ `
  query GetNewLoanUpdate($id: Int!) {
    updates: allLoanUpdates(filter: { id: { greaterThan: $id } }, orderBy: ID_DESC, first: 1) {
      nodes {
        id
        type
        amount
        amountValueUsd
        timestamp
        loanByLoanId {
          id
          asset
          accountByBorrowerId {
            idSs58
          }
        }
      }
    }
  }
`);

export const getLatestLendingLiquidityChangeIdQuery = gql(/* GraphQL */ `
  query GetLatestLendingLiquidityChangeId {
    liquidityChanges: allLendingLiquidityBalanceChanges(first: 1, orderBy: ID_DESC) {
      nodes {
        id
      }
    }
  }
`);

export const getNewLendingLiquidityChangeQuery = gql(/* GraphQL */ `
  query GetNewLendingLiquidityChange($id: Int!) {
    liquidityChanges: allLendingLiquidityBalanceChanges(
      filter: { id: { greaterThan: $id }, type: { in: [WITHDRAWAL, DEPOSIT] } }
      orderBy: ID_DESC
      first: 1
    ) {
      nodes {
        id
        type
        asset
        amount
        amountUsd
        timestamp
        accountByLiquidityProviderId {
          idSs58
        }
      }
    }
  }
`);

export const getLatestLiquidationSwapRequestIdQuery = gql(/* GraphQL */ `
  query GetLatestLiquidationSwapRequestId {
    requests: allLiquidationSwapRequests(first: 1, orderBy: ID_DESC) {
      nodes {
        id
      }
    }
  }
`);

export const getNewLiquidationSwapRequestsQuery = gql(/* GraphQL */ `
  query GetNewLiquidationSwapRequests($id: Int!) {
    requests: allLiquidationSwapRequests(filter: { id: { greaterThan: $id } }, orderBy: ID_ASC) {
      nodes {
        id
        swapRequestId
        createdAtEventId
        completedAtEventId
        abortedAtEventId
        loanByLoanId {
          id
          asset
          lastUpdatedAtTimestamp
          accountByBorrowerId {
            idSs58
          }
        }
      }
    }
  }
`);

export const getLiquidationStatusBySwapRequestIdsQuery = gql(/* GraphQL */ `
  query GetLiquidationStatusBySwapRequestIds($swapRequestIds: [BigInt!]!) {
    requests: allLiquidationSwapRequests(
      filter: { swapRequestId: { in: $swapRequestIds } }
      orderBy: ID_DESC
    ) {
      nodes {
        swapRequestId
        completedAtEventId
        abortedAtEventId
        loanByLoanId {
          id
        }
      }
    }
  }
`);
