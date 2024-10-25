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
  '\n  query GetNewSwapRequestsQuery($id: Int!) {\n    allSwapRequests(filter: { id: { greaterThan: $id } }) {\n      nodes {\n        id\n      }\n    }\n  }\n':
    types.GetNewSwapRequestsQueryDocument,
  '\n  query GetSwapInfoByNativeId($nativeId: BigInt!) {\n    swap: swapRequestByNativeId(nativeId: $nativeId) {\n      completedEventId\n      nativeId\n      depositAmount\n      depositValueUsd\n      egressByEgressId {\n        amount\n        valueUsd\n        eventByScheduledEventId {\n          blockByBlockId {\n            timestamp\n          }\n        }\n      }\n      swapChannelByDepositChannelId {\n        brokerByBrokerId {\n          accountId\n        }\n        fokMinPriceX128\n        issuedBlockTimestamp\n      }\n      foreignChainTrackingByForeignChainPreDepositBlockId {\n        stateChainTimestamp\n      }\n      foreignChainTrackingByForeignChainDepositBlockId {\n        stateChainTimestamp\n      }\n      sourceChain\n      numberOfChunks\n    }\n  }\n':
    types.GetSwapInfoByNativeIdDocument,
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
export function gql(
  source: '\n  query GetNewSwapRequestsQuery($id: Int!) {\n    allSwapRequests(filter: { id: { greaterThan: $id } }) {\n      nodes {\n        id\n      }\n    }\n  }\n',
): (typeof documents)['\n  query GetNewSwapRequestsQuery($id: Int!) {\n    allSwapRequests(filter: { id: { greaterThan: $id } }) {\n      nodes {\n        id\n      }\n    }\n  }\n'];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: '\n  query GetSwapInfoByNativeId($nativeId: BigInt!) {\n    swap: swapRequestByNativeId(nativeId: $nativeId) {\n      completedEventId\n      nativeId\n      depositAmount\n      depositValueUsd\n      egressByEgressId {\n        amount\n        valueUsd\n        eventByScheduledEventId {\n          blockByBlockId {\n            timestamp\n          }\n        }\n      }\n      swapChannelByDepositChannelId {\n        brokerByBrokerId {\n          accountId\n        }\n        fokMinPriceX128\n        issuedBlockTimestamp\n      }\n      foreignChainTrackingByForeignChainPreDepositBlockId {\n        stateChainTimestamp\n      }\n      foreignChainTrackingByForeignChainDepositBlockId {\n        stateChainTimestamp\n      }\n      sourceChain\n      numberOfChunks\n    }\n  }\n',
): (typeof documents)['\n  query GetSwapInfoByNativeId($nativeId: BigInt!) {\n    swap: swapRequestByNativeId(nativeId: $nativeId) {\n      completedEventId\n      nativeId\n      depositAmount\n      depositValueUsd\n      egressByEgressId {\n        amount\n        valueUsd\n        eventByScheduledEventId {\n          blockByBlockId {\n            timestamp\n          }\n        }\n      }\n      swapChannelByDepositChannelId {\n        brokerByBrokerId {\n          accountId\n        }\n        fokMinPriceX128\n        issuedBlockTimestamp\n      }\n      foreignChainTrackingByForeignChainPreDepositBlockId {\n        stateChainTimestamp\n      }\n      foreignChainTrackingByForeignChainDepositBlockId {\n        stateChainTimestamp\n      }\n      sourceChain\n      numberOfChunks\n    }\n  }\n'];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
