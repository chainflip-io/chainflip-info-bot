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
const documents = {
    "\n  query getBurns($in: [Int!]) {\n    allBurns(filter: { id: { in: $in } }) {\n      aggregates {\n        sum {\n          amount\n          valueUsd\n        }\n      }\n    }\n  }\n": types.GetBurnsDocument,
    "\n  query GetSwapInfoByNativeId($nativeId: BigInt!) {\n    swap: swapRequestByNativeId(nativeId: $nativeId) {\n      completedEventId\n      nativeId\n      depositAmount\n      depositValueUsd\n      egress: egressByEgressId {\n        amount\n        valueUsd\n        scheduledEvent: eventByScheduledEventId {\n          block: blockByBlockId {\n            timestamp\n          }\n        }\n      }\n      swapChannel: swapChannelByDepositChannelId {\n        broker: brokerByBrokerId {\n          account: accountByAccountId {\n            alias\n            idSs58\n          }\n        }\n        fokMinPriceX128\n        issuedBlockTimestamp\n      }\n      preDepositBlock: foreignChainTrackingByForeignChainPreDepositBlockId {\n        stateChainTimestamp\n      }\n      depositBlock: foreignChainTrackingByForeignChainDepositBlockId {\n        stateChainTimestamp\n      }\n      sourceChain\n      numberOfChunks\n    }\n  }\n": types.GetSwapInfoByNativeIdDocument,
    "\n  query GetNewLiquididityDeposits($id: Int!) {\n    deposits: allLiquidityDeposits(filter: { id: { greaterThan: $id } }, orderBy: ID_ASC) {\n      nodes {\n        asset\n        depositAmount\n        depositValueUsd\n        liquidityProviderId\n      }\n    }\n  }\n": types.GetNewLiquididityDepositsDocument,
    "\n  query CheckHasOldDeposit($id: Int!, $liquidityProviderId: Int!) {\n    deposits: allLiquidityDeposits(\n      filter: { id: { lessThan: $id }, liquidityProviderId: { equalTo: $liquidityProviderId } }\n    ) {\n      nodes {\n        id\n        liquidityProviderId\n      }\n    }\n  }\n": types.CheckHasOldDepositDocument,
    "\n  query GetNewSwapRequests($nativeId: BigInt!) {\n    swapRequests: allSwapRequests(\n      filter: { nativeId: { greaterThan: $nativeId }, type: { in: [REGULAR, CCM] } }\n    ) {\n      nodes {\n        nativeId\n      }\n    }\n  }\n": types.GetNewSwapRequestsDocument,
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
export function gql(source: "\n  query getBurns($in: [Int!]) {\n    allBurns(filter: { id: { in: $in } }) {\n      aggregates {\n        sum {\n          amount\n          valueUsd\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query getBurns($in: [Int!]) {\n    allBurns(filter: { id: { in: $in } }) {\n      aggregates {\n        sum {\n          amount\n          valueUsd\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetSwapInfoByNativeId($nativeId: BigInt!) {\n    swap: swapRequestByNativeId(nativeId: $nativeId) {\n      completedEventId\n      nativeId\n      depositAmount\n      depositValueUsd\n      egress: egressByEgressId {\n        amount\n        valueUsd\n        scheduledEvent: eventByScheduledEventId {\n          block: blockByBlockId {\n            timestamp\n          }\n        }\n      }\n      swapChannel: swapChannelByDepositChannelId {\n        broker: brokerByBrokerId {\n          account: accountByAccountId {\n            alias\n            idSs58\n          }\n        }\n        fokMinPriceX128\n        issuedBlockTimestamp\n      }\n      preDepositBlock: foreignChainTrackingByForeignChainPreDepositBlockId {\n        stateChainTimestamp\n      }\n      depositBlock: foreignChainTrackingByForeignChainDepositBlockId {\n        stateChainTimestamp\n      }\n      sourceChain\n      numberOfChunks\n    }\n  }\n"): (typeof documents)["\n  query GetSwapInfoByNativeId($nativeId: BigInt!) {\n    swap: swapRequestByNativeId(nativeId: $nativeId) {\n      completedEventId\n      nativeId\n      depositAmount\n      depositValueUsd\n      egress: egressByEgressId {\n        amount\n        valueUsd\n        scheduledEvent: eventByScheduledEventId {\n          block: blockByBlockId {\n            timestamp\n          }\n        }\n      }\n      swapChannel: swapChannelByDepositChannelId {\n        broker: brokerByBrokerId {\n          account: accountByAccountId {\n            alias\n            idSs58\n          }\n        }\n        fokMinPriceX128\n        issuedBlockTimestamp\n      }\n      preDepositBlock: foreignChainTrackingByForeignChainPreDepositBlockId {\n        stateChainTimestamp\n      }\n      depositBlock: foreignChainTrackingByForeignChainDepositBlockId {\n        stateChainTimestamp\n      }\n      sourceChain\n      numberOfChunks\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetNewLiquididityDeposits($id: Int!) {\n    deposits: allLiquidityDeposits(filter: { id: { greaterThan: $id } }, orderBy: ID_ASC) {\n      nodes {\n        asset\n        depositAmount\n        depositValueUsd\n        liquidityProviderId\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetNewLiquididityDeposits($id: Int!) {\n    deposits: allLiquidityDeposits(filter: { id: { greaterThan: $id } }, orderBy: ID_ASC) {\n      nodes {\n        asset\n        depositAmount\n        depositValueUsd\n        liquidityProviderId\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CheckHasOldDeposit($id: Int!, $liquidityProviderId: Int!) {\n    deposits: allLiquidityDeposits(\n      filter: { id: { lessThan: $id }, liquidityProviderId: { equalTo: $liquidityProviderId } }\n    ) {\n      nodes {\n        id\n        liquidityProviderId\n      }\n    }\n  }\n"): (typeof documents)["\n  query CheckHasOldDeposit($id: Int!, $liquidityProviderId: Int!) {\n    deposits: allLiquidityDeposits(\n      filter: { id: { lessThan: $id }, liquidityProviderId: { equalTo: $liquidityProviderId } }\n    ) {\n      nodes {\n        id\n        liquidityProviderId\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetNewSwapRequests($nativeId: BigInt!) {\n    swapRequests: allSwapRequests(\n      filter: { nativeId: { greaterThan: $nativeId }, type: { in: [REGULAR, CCM] } }\n    ) {\n      nodes {\n        nativeId\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetNewSwapRequests($nativeId: BigInt!) {\n    swapRequests: allSwapRequests(\n      filter: { nativeId: { greaterThan: $nativeId }, type: { in: [REGULAR, CCM] } }\n    ) {\n      nodes {\n        nativeId\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;