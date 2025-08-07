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
};
const documents: Documents = {
    "\n  query GetBoostSummary($start: Datetime!, $end: Datetime!, $asset: ChainflipAsset!) {\n    boostPools: allBoostPools(filter: { asset: { equalTo: $asset } }) {\n      nodes {\n        asset\n        feeTierPips\n        boostShares: boostSharesByBoostPoolId(\n          filter: {\n            executedAtTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end }\n            lost: { equalTo: false }\n          }\n        ) {\n          aggregates {\n            sum {\n              fee\n              feeUsd\n              amount\n              amountUsd\n            }\n          }\n        }\n        apys: boostPoolApiesByBoostPoolId(orderBy: BLOCK_DESC, first: 1) {\n          nodes {\n            projectedApy\n          }\n        }\n      }\n    }\n  }\n": types.GetBoostSummaryDocument,
    "\n  query GetLpFills($start: Datetime!, $end: Datetime!) {\n    limitOrders: allLimitOrderFills(\n      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }\n    ) {\n      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {\n        keys\n        sum {\n          filledAmountValueUsd\n        }\n      }\n    }\n    rangeOrders: allRangeOrderFills(\n      filter: { blockTimestamp: { greaterThanOrEqualTo: $start, lessThanOrEqualTo: $end } }\n    ) {\n      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {\n        keys\n        sum {\n          baseFilledAmountValueUsd\n          quoteFilledAmountValueUsd\n        }\n      }\n    }\n  }\n": types.GetLpFillsDocument,
    "\n  query GetAccount($ids: [Int!]) {\n    accounts: allAccounts(filter: { id: { in: $ids } }) {\n      nodes {\n        id\n        type\n        idSs58\n      }\n    }\n  }\n": types.GetAccountDocument,
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

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;