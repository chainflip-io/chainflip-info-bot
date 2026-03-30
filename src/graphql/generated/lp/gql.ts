/* eslint-disable */
import * as types from './graphql.js';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetBoostSummary($start: Datetime!, $end: Datetime!, $asset: ChainflipAsset!) {\n    boostPools: allBoostPools(filter: { asset: { equalTo: $asset } }) {\n      nodes {\n        asset\n        feeTierPips\n        boostShares: boostSharesByBoostPoolId(\n          filter: {\n            executedAtTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end }\n            lost: { equalTo: false }\n          }\n        ) {\n          aggregates {\n            sum {\n              fee\n              feeUsd\n              amount\n              amountUsd\n            }\n          }\n        }\n        apys: boostPoolApiesByBoostPoolId(orderBy: BLOCK_DESC, first: 1) {\n          nodes {\n            projectedApy\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetBoostSummaryDocument,
    "\n  query GetLpFills($start: Datetime!, $end: Datetime!) {\n    limitOrders: allLimitOrderFills(\n      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }\n    ) {\n      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {\n        keys\n        sum {\n          filledAmountValueUsd\n        }\n      }\n    }\n    rangeOrders: allRangeOrderFills(\n      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }\n    ) {\n      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {\n        keys\n        sum {\n          baseFilledAmountValueUsd\n          quoteFilledAmountValueUsd\n        }\n      }\n    }\n  }\n": typeof types.GetLpFillsDocument,
    "\n  query GetAccount($ids: [Int!]) {\n    accounts: allAccounts(filter: { id: { in: $ids } }) {\n      nodes {\n        id\n        type\n        idSs58\n      }\n    }\n  }\n": typeof types.GetAccountDocument,
    "\n  query GetLatestLoanUpdateId {\n    updates: allLoanUpdates(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n": typeof types.GetLatestLoanUpdateIdDocument,
    "\n  query GetNewLoanUpdate($id: Int!) {\n    updates: allLoanUpdates(filter: { id: { greaterThan: $id } }, orderBy: ID_DESC, first: 1) {\n      nodes {\n        id\n        type\n        amount\n        amountValueUsd\n        timestamp\n        loanByLoanId {\n          id\n          asset\n          accountByBorrowerId {\n            idSs58\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetNewLoanUpdateDocument,
    "\n  query GetLatestLendingLiquidityChangeId {\n    liquidityChanges: allLendingLiquidityBalanceChanges(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n": typeof types.GetLatestLendingLiquidityChangeIdDocument,
    "\n  query GetNewLendingLiquidityChange($id: Int!) {\n    liquidityChanges: allLendingLiquidityBalanceChanges(\n      filter: { id: { greaterThan: $id }, type: { in: [WITHDRAWAL, DEPOSIT] } }\n      orderBy: ID_DESC\n      first: 1\n    ) {\n      nodes {\n        id\n        type\n        asset\n        amount\n        amountUsd\n        timestamp\n        accountByLiquidityProviderId {\n          idSs58\n        }\n      }\n    }\n  }\n": typeof types.GetNewLendingLiquidityChangeDocument,
    "\n  query GetLatestLiquidationSwapRequestId {\n    requests: allLiquidationSwapRequests(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n": typeof types.GetLatestLiquidationSwapRequestIdDocument,
    "\n  query GetNewLiquidationSwapRequests($id: Int!) {\n    requests: allLiquidationSwapRequests(filter: { id: { greaterThan: $id } }, orderBy: ID_ASC) {\n      nodes {\n        id\n        swapRequestId\n        createdAtEventId\n        completedAtEventId\n        abortedAtEventId\n        loanByLoanId {\n          id\n          asset\n          lastUpdatedAtTimestamp\n          accountByBorrowerId {\n            idSs58\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetNewLiquidationSwapRequestsDocument,
    "\n  query GetLiquidationStatusBySwapRequestIds($swapRequestIds: [BigInt!]!) {\n    requests: allLiquidationSwapRequests(\n      filter: { swapRequestId: { in: $swapRequestIds } }\n      orderBy: ID_DESC\n    ) {\n      nodes {\n        swapRequestId\n        completedAtEventId\n        abortedAtEventId\n        loanByLoanId {\n          id\n        }\n      }\n    }\n  }\n": typeof types.GetLiquidationStatusBySwapRequestIdsDocument,
};
const documents: Documents = {
    "\n  query GetBoostSummary($start: Datetime!, $end: Datetime!, $asset: ChainflipAsset!) {\n    boostPools: allBoostPools(filter: { asset: { equalTo: $asset } }) {\n      nodes {\n        asset\n        feeTierPips\n        boostShares: boostSharesByBoostPoolId(\n          filter: {\n            executedAtTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end }\n            lost: { equalTo: false }\n          }\n        ) {\n          aggregates {\n            sum {\n              fee\n              feeUsd\n              amount\n              amountUsd\n            }\n          }\n        }\n        apys: boostPoolApiesByBoostPoolId(orderBy: BLOCK_DESC, first: 1) {\n          nodes {\n            projectedApy\n          }\n        }\n      }\n    }\n  }\n": types.GetBoostSummaryDocument,
    "\n  query GetLpFills($start: Datetime!, $end: Datetime!) {\n    limitOrders: allLimitOrderFills(\n      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }\n    ) {\n      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {\n        keys\n        sum {\n          filledAmountValueUsd\n        }\n      }\n    }\n    rangeOrders: allRangeOrderFills(\n      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }\n    ) {\n      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {\n        keys\n        sum {\n          baseFilledAmountValueUsd\n          quoteFilledAmountValueUsd\n        }\n      }\n    }\n  }\n": types.GetLpFillsDocument,
    "\n  query GetAccount($ids: [Int!]) {\n    accounts: allAccounts(filter: { id: { in: $ids } }) {\n      nodes {\n        id\n        type\n        idSs58\n      }\n    }\n  }\n": types.GetAccountDocument,
    "\n  query GetLatestLoanUpdateId {\n    updates: allLoanUpdates(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n": types.GetLatestLoanUpdateIdDocument,
    "\n  query GetNewLoanUpdate($id: Int!) {\n    updates: allLoanUpdates(filter: { id: { greaterThan: $id } }, orderBy: ID_DESC, first: 1) {\n      nodes {\n        id\n        type\n        amount\n        amountValueUsd\n        timestamp\n        loanByLoanId {\n          id\n          asset\n          accountByBorrowerId {\n            idSs58\n          }\n        }\n      }\n    }\n  }\n": types.GetNewLoanUpdateDocument,
    "\n  query GetLatestLendingLiquidityChangeId {\n    liquidityChanges: allLendingLiquidityBalanceChanges(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n": types.GetLatestLendingLiquidityChangeIdDocument,
    "\n  query GetNewLendingLiquidityChange($id: Int!) {\n    liquidityChanges: allLendingLiquidityBalanceChanges(\n      filter: { id: { greaterThan: $id }, type: { in: [WITHDRAWAL, DEPOSIT] } }\n      orderBy: ID_DESC\n      first: 1\n    ) {\n      nodes {\n        id\n        type\n        asset\n        amount\n        amountUsd\n        timestamp\n        accountByLiquidityProviderId {\n          idSs58\n        }\n      }\n    }\n  }\n": types.GetNewLendingLiquidityChangeDocument,
    "\n  query GetLatestLiquidationSwapRequestId {\n    requests: allLiquidationSwapRequests(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n": types.GetLatestLiquidationSwapRequestIdDocument,
    "\n  query GetNewLiquidationSwapRequests($id: Int!) {\n    requests: allLiquidationSwapRequests(filter: { id: { greaterThan: $id } }, orderBy: ID_ASC) {\n      nodes {\n        id\n        swapRequestId\n        createdAtEventId\n        completedAtEventId\n        abortedAtEventId\n        loanByLoanId {\n          id\n          asset\n          lastUpdatedAtTimestamp\n          accountByBorrowerId {\n            idSs58\n          }\n        }\n      }\n    }\n  }\n": types.GetNewLiquidationSwapRequestsDocument,
    "\n  query GetLiquidationStatusBySwapRequestIds($swapRequestIds: [BigInt!]!) {\n    requests: allLiquidationSwapRequests(\n      filter: { swapRequestId: { in: $swapRequestIds } }\n      orderBy: ID_DESC\n    ) {\n      nodes {\n        swapRequestId\n        completedAtEventId\n        abortedAtEventId\n        loanByLoanId {\n          id\n        }\n      }\n    }\n  }\n": types.GetLiquidationStatusBySwapRequestIdsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetBoostSummary($start: Datetime!, $end: Datetime!, $asset: ChainflipAsset!) {\n    boostPools: allBoostPools(filter: { asset: { equalTo: $asset } }) {\n      nodes {\n        asset\n        feeTierPips\n        boostShares: boostSharesByBoostPoolId(\n          filter: {\n            executedAtTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end }\n            lost: { equalTo: false }\n          }\n        ) {\n          aggregates {\n            sum {\n              fee\n              feeUsd\n              amount\n              amountUsd\n            }\n          }\n        }\n        apys: boostPoolApiesByBoostPoolId(orderBy: BLOCK_DESC, first: 1) {\n          nodes {\n            projectedApy\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetBoostSummary($start: Datetime!, $end: Datetime!, $asset: ChainflipAsset!) {\n    boostPools: allBoostPools(filter: { asset: { equalTo: $asset } }) {\n      nodes {\n        asset\n        feeTierPips\n        boostShares: boostSharesByBoostPoolId(\n          filter: {\n            executedAtTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end }\n            lost: { equalTo: false }\n          }\n        ) {\n          aggregates {\n            sum {\n              fee\n              feeUsd\n              amount\n              amountUsd\n            }\n          }\n        }\n        apys: boostPoolApiesByBoostPoolId(orderBy: BLOCK_DESC, first: 1) {\n          nodes {\n            projectedApy\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetLpFills($start: Datetime!, $end: Datetime!) {\n    limitOrders: allLimitOrderFills(\n      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }\n    ) {\n      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {\n        keys\n        sum {\n          filledAmountValueUsd\n        }\n      }\n    }\n    rangeOrders: allRangeOrderFills(\n      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }\n    ) {\n      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {\n        keys\n        sum {\n          baseFilledAmountValueUsd\n          quoteFilledAmountValueUsd\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetLpFills($start: Datetime!, $end: Datetime!) {\n    limitOrders: allLimitOrderFills(\n      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }\n    ) {\n      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {\n        keys\n        sum {\n          filledAmountValueUsd\n        }\n      }\n    }\n    rangeOrders: allRangeOrderFills(\n      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }\n    ) {\n      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {\n        keys\n        sum {\n          baseFilledAmountValueUsd\n          quoteFilledAmountValueUsd\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAccount($ids: [Int!]) {\n    accounts: allAccounts(filter: { id: { in: $ids } }) {\n      nodes {\n        id\n        type\n        idSs58\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetAccount($ids: [Int!]) {\n    accounts: allAccounts(filter: { id: { in: $ids } }) {\n      nodes {\n        id\n        type\n        idSs58\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetLatestLoanUpdateId {\n    updates: allLoanUpdates(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetLatestLoanUpdateId {\n    updates: allLoanUpdates(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetNewLoanUpdate($id: Int!) {\n    updates: allLoanUpdates(filter: { id: { greaterThan: $id } }, orderBy: ID_DESC, first: 1) {\n      nodes {\n        id\n        type\n        amount\n        amountValueUsd\n        timestamp\n        loanByLoanId {\n          id\n          asset\n          accountByBorrowerId {\n            idSs58\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetNewLoanUpdate($id: Int!) {\n    updates: allLoanUpdates(filter: { id: { greaterThan: $id } }, orderBy: ID_DESC, first: 1) {\n      nodes {\n        id\n        type\n        amount\n        amountValueUsd\n        timestamp\n        loanByLoanId {\n          id\n          asset\n          accountByBorrowerId {\n            idSs58\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetLatestLendingLiquidityChangeId {\n    liquidityChanges: allLendingLiquidityBalanceChanges(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetLatestLendingLiquidityChangeId {\n    liquidityChanges: allLendingLiquidityBalanceChanges(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetNewLendingLiquidityChange($id: Int!) {\n    liquidityChanges: allLendingLiquidityBalanceChanges(\n      filter: { id: { greaterThan: $id }, type: { in: [WITHDRAWAL, DEPOSIT] } }\n      orderBy: ID_DESC\n      first: 1\n    ) {\n      nodes {\n        id\n        type\n        asset\n        amount\n        amountUsd\n        timestamp\n        accountByLiquidityProviderId {\n          idSs58\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetNewLendingLiquidityChange($id: Int!) {\n    liquidityChanges: allLendingLiquidityBalanceChanges(\n      filter: { id: { greaterThan: $id }, type: { in: [WITHDRAWAL, DEPOSIT] } }\n      orderBy: ID_DESC\n      first: 1\n    ) {\n      nodes {\n        id\n        type\n        asset\n        amount\n        amountUsd\n        timestamp\n        accountByLiquidityProviderId {\n          idSs58\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetLatestLiquidationSwapRequestId {\n    requests: allLiquidationSwapRequests(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetLatestLiquidationSwapRequestId {\n    requests: allLiquidationSwapRequests(first: 1, orderBy: ID_DESC) {\n      nodes {\n        id\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetNewLiquidationSwapRequests($id: Int!) {\n    requests: allLiquidationSwapRequests(filter: { id: { greaterThan: $id } }, orderBy: ID_ASC) {\n      nodes {\n        id\n        swapRequestId\n        createdAtEventId\n        completedAtEventId\n        abortedAtEventId\n        loanByLoanId {\n          id\n          asset\n          lastUpdatedAtTimestamp\n          accountByBorrowerId {\n            idSs58\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetNewLiquidationSwapRequests($id: Int!) {\n    requests: allLiquidationSwapRequests(filter: { id: { greaterThan: $id } }, orderBy: ID_ASC) {\n      nodes {\n        id\n        swapRequestId\n        createdAtEventId\n        completedAtEventId\n        abortedAtEventId\n        loanByLoanId {\n          id\n          asset\n          lastUpdatedAtTimestamp\n          accountByBorrowerId {\n            idSs58\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetLiquidationStatusBySwapRequestIds($swapRequestIds: [BigInt!]!) {\n    requests: allLiquidationSwapRequests(\n      filter: { swapRequestId: { in: $swapRequestIds } }\n      orderBy: ID_DESC\n    ) {\n      nodes {\n        swapRequestId\n        completedAtEventId\n        abortedAtEventId\n        loanByLoanId {\n          id\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetLiquidationStatusBySwapRequestIds($swapRequestIds: [BigInt!]!) {\n    requests: allLiquidationSwapRequests(\n      filter: { swapRequestId: { in: $swapRequestIds } }\n      orderBy: ID_DESC\n    ) {\n      nodes {\n        swapRequestId\n        completedAtEventId\n        abortedAtEventId\n        loanByLoanId {\n          id\n        }\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;