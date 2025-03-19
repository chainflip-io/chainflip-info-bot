import { gql } from '../graphql/generated/lp/gql.js';

export const getLpFeeInfo = gql(/* GraphQL */ `
  query GetLpFeeInfo($start: Datetime!, $end: Datetime!) {
    limitOrderFills: allLimitOrderFills(
      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }
    ) {
      aggregates {
        sum {
          feesEarnedValueUsd
        }
      }
    }
    rangeOrderFills: allRangeOrderFills(
      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }
    ) {
      aggregates {
        sum {
          baseFeesEarnedValueUsd
          quoteFeesEarnedValueUsd
        }
      }
    }
  }
`);

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
        idSs58
      }
    }
  }
`);
