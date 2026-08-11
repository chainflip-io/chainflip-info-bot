/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AccountType =
  | 'BROKER'
  | 'LIQUIDITY_PROVIDER'
  | 'TRADING_STRATEGY'
  | 'UNREGISTERED'
  | 'VALIDATOR';

export type ChainflipAsset =
  | 'ArbEth'
  | 'ArbUsdc'
  | 'ArbUsdt'
  | 'Bnb'
  | 'BscUsdt'
  | 'Btc'
  | 'Cbbtc'
  | 'Dot'
  | 'Eth'
  | 'Flip'
  | 'HubDot'
  | 'HubUsdc'
  | 'HubUsdt'
  | 'Sol'
  | 'SolUsdc'
  | 'SolUsdt'
  | 'Trx'
  | 'TrxUsdt'
  | 'Usdc'
  | 'Usdt'
  | 'Wbtc';

export type LendingPoolBalanceChangeType =
  | 'FEES_ACCRUED'
  | 'LIQUIDATION_LOSS'
  | 'MANUAL_DEPOSIT'
  | 'MANUAL_WITHDRAWAL'
  | 'SYSTEM_LIQUIDATION_EXCESS_AMOUNT_DEPOSIT'
  | 'SYSTEM_LIQUIDATION_UNUSED_AMOUNT_DEPOSIT'
  | 'SYSTEM_LIQUIDATION_WITHDRAWAL';

export type LoanUpdateType =
  | 'BORROWING'
  | 'REPAYMENT';

export type GetBoostSummaryQueryVariables = Exact<{
  start: string;
  end: string;
  asset: ChainflipAsset;
}>;


export type GetBoostSummaryQuery = { boostPools: { nodes: Array<{ asset: ChainflipAsset, feeTierPips: number, boostShares: { aggregates: { sum: { fee: `${number}`, feeUsd: `${number}`, amount: `${number}`, amountUsd: `${number}` } | null } | null }, apys: { nodes: Array<{ projectedApy72H: `${number}` | null }> } }> } | null };

export type GetLpFillsQueryVariables = Exact<{
  start: string;
  end: string;
}>;


export type GetLpFillsQuery = { limitOrders: { groupedAggregates: Array<{ keys: Array<string> | null, sum: { filledAmountValueUsd: `${number}` } | null }> | null } | null, rangeOrders: { groupedAggregates: Array<{ keys: Array<string> | null, sum: { baseFilledAmountValueUsd: `${number}`, quoteFilledAmountValueUsd: `${number}` } | null }> | null } | null };

export type GetAccountQueryVariables = Exact<{
  ids?: Array<number> | number | null | undefined;
}>;


export type GetAccountQuery = { accounts: { nodes: Array<{ id: number, type: AccountType, idSs58: string }> } | null };

export type GetLatestLoanUpdateIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLatestLoanUpdateIdQuery = { updates: { nodes: Array<{ id: number }> } | null };

export type GetNewLoanUpdateQueryVariables = Exact<{
  id: number;
}>;


export type GetNewLoanUpdateQuery = { updates: { nodes: Array<{ id: number, type: LoanUpdateType, amount: `${number}`, amountValueUsd: `${number}`, timestamp: string, loanByLoanId: { id: `${number}`, asset: ChainflipAsset, accountByBorrowerId: { idSs58: string } | null } }> } | null };

export type GetLatestLendingLiquidityChangeIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLatestLendingLiquidityChangeIdQuery = { liquidityChanges: { nodes: Array<{ id: number }> } | null };

export type GetNewLendingLiquidityChangeQueryVariables = Exact<{
  id: number;
}>;


export type GetNewLendingLiquidityChangeQuery = { liquidityChanges: { nodes: Array<{ id: number, type: LendingPoolBalanceChangeType, asset: ChainflipAsset, amount: `${number}`, amountUsd: `${number}` | null, timestamp: string, accountByLiquidityProviderId: { idSs58: string } | null }> } | null };

export type GetLatestLiquidationSwapRequestIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLatestLiquidationSwapRequestIdQuery = { requests: { nodes: Array<{ swapRequestId: `${number}` }> } | null };

export type GetBoundaryLiquidationSwapRequestIdQueryVariables = Exact<{
  minTimestamp: string;
}>;


export type GetBoundaryLiquidationSwapRequestIdQuery = { requests: { nodes: Array<{ swapRequestId: `${number}` }> } | null };

export type GetNewLiquidationSwapRequestsQueryVariables = Exact<{
  swapRequestId: `${number}`;
  minTimestamp: string;
}>;


export type GetNewLiquidationSwapRequestsQuery = { requests: { nodes: Array<{ id: number, swapRequestId: `${number}`, createdAtEventId: `${number}`, loanByLoanId: { id: `${number}`, asset: ChainflipAsset, accountByBorrowerId: { idSs58: string } | null } }> } | null };

export type GetLiquidationStatusBySwapRequestIdsQueryVariables = Exact<{
  swapRequestIds: Array<`${number}`> | `${number}`;
}>;


export type GetLiquidationStatusBySwapRequestIdsQuery = { requests: { nodes: Array<{ swapRequestId: `${number}`, completedAtEventId: `${number}` | null, abortedAtEventId: `${number}` | null, loanByLoanId: { id: `${number}` } }> } | null };


export const GetBoostSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBoostSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"start"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"end"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"asset"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChainflipAsset"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"boostPools"},"name":{"kind":"Name","value":"allBoostPools"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"asset"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"asset"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"asset"}},{"kind":"Field","name":{"kind":"Name","value":"feeTierPips"}},{"kind":"Field","alias":{"kind":"Name","value":"boostShares"},"name":{"kind":"Name","value":"boostSharesByBoostPoolId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"executedAtTimestamp"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"start"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"lessThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"end"}}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"lost"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"equalTo"},"value":{"kind":"BooleanValue","value":false}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"aggregates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fee"}},{"kind":"Field","name":{"kind":"Name","value":"feeUsd"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountUsd"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"apys"},"name":{"kind":"Name","value":"boostPoolApiesByBoostPoolId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"BLOCK_DESC"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectedApy72H"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetBoostSummaryQuery, GetBoostSummaryQueryVariables>;
export const GetLpFillsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLpFills"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"start"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"end"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"limitOrders"},"name":{"kind":"Name","value":"allLimitOrderFills"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"blockTimestamp"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"start"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"lessThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"end"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupedAggregates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupBy"},"value":{"kind":"EnumValue","value":"LIQUIDITY_PROVIDER_ID"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"keys"}},{"kind":"Field","name":{"kind":"Name","value":"sum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"filledAmountValueUsd"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"rangeOrders"},"name":{"kind":"Name","value":"allRangeOrderFills"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"blockTimestamp"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"start"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"lessThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"end"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupedAggregates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"groupBy"},"value":{"kind":"EnumValue","value":"LIQUIDITY_PROVIDER_ID"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"keys"}},{"kind":"Field","name":{"kind":"Name","value":"sum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"baseFilledAmountValueUsd"}},{"kind":"Field","name":{"kind":"Name","value":"quoteFilledAmountValueUsd"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetLpFillsQuery, GetLpFillsQueryVariables>;
export const GetAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"accounts"},"name":{"kind":"Name","value":"allAccounts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"idSs58"}}]}}]}}]}}]} as unknown as DocumentNode<GetAccountQuery, GetAccountQueryVariables>;
export const GetLatestLoanUpdateIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLatestLoanUpdateId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"updates"},"name":{"kind":"Name","value":"allLoanUpdates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GetLatestLoanUpdateIdQuery, GetLatestLoanUpdateIdQueryVariables>;
export const GetNewLoanUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNewLoanUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"updates"},"name":{"kind":"Name","value":"allLoanUpdates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThan"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_ASC"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountValueUsd"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"loanByLoanId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"asset"}},{"kind":"Field","name":{"kind":"Name","value":"accountByBorrowerId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"idSs58"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetNewLoanUpdateQuery, GetNewLoanUpdateQueryVariables>;
export const GetLatestLendingLiquidityChangeIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLatestLendingLiquidityChangeId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"liquidityChanges"},"name":{"kind":"Name","value":"allLendingLiquidityBalanceChanges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GetLatestLendingLiquidityChangeIdQuery, GetLatestLendingLiquidityChangeIdQueryVariables>;
export const GetNewLendingLiquidityChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNewLendingLiquidityChange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"liquidityChanges"},"name":{"kind":"Name","value":"allLendingLiquidityBalanceChanges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThan"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"type"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"ListValue","values":[{"kind":"EnumValue","value":"MANUAL_WITHDRAWAL"},{"kind":"EnumValue","value":"MANUAL_DEPOSIT"}]}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"ID_ASC"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"asset"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountUsd"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"accountByLiquidityProviderId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"idSs58"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetNewLendingLiquidityChangeQuery, GetNewLendingLiquidityChangeQueryVariables>;
export const GetLatestLiquidationSwapRequestIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLatestLiquidationSwapRequestId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"requests"},"name":{"kind":"Name","value":"allLiquidationSwapRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"SWAP_REQUEST_ID_DESC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"swapRequestId"}}]}}]}}]}}]} as unknown as DocumentNode<GetLatestLiquidationSwapRequestIdQuery, GetLatestLiquidationSwapRequestIdQueryVariables>;
export const GetBoundaryLiquidationSwapRequestIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBoundaryLiquidationSwapRequestId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"minTimestamp"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"requests"},"name":{"kind":"Name","value":"allLiquidationSwapRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eventByCreatedAtEventId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"timestamp"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"lessThanOrEqualTo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"minTimestamp"}}}]}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"SWAP_REQUEST_ID_DESC"}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"swapRequestId"}}]}}]}}]}}]} as unknown as DocumentNode<GetBoundaryLiquidationSwapRequestIdQuery, GetBoundaryLiquidationSwapRequestIdQueryVariables>;
export const GetNewLiquidationSwapRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNewLiquidationSwapRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"swapRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BigInt"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"minTimestamp"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"requests"},"name":{"kind":"Name","value":"allLiquidationSwapRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"swapRequestId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThan"},"value":{"kind":"Variable","name":{"kind":"Name","value":"swapRequestId"}}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"eventByCreatedAtEventId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"timestamp"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"greaterThan"},"value":{"kind":"Variable","name":{"kind":"Name","value":"minTimestamp"}}}]}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"SWAP_REQUEST_ID_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"swapRequestId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAtEventId"}},{"kind":"Field","name":{"kind":"Name","value":"loanByLoanId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"asset"}},{"kind":"Field","name":{"kind":"Name","value":"accountByBorrowerId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"idSs58"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetNewLiquidationSwapRequestsQuery, GetNewLiquidationSwapRequestsQueryVariables>;
export const GetLiquidationStatusBySwapRequestIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLiquidationStatusBySwapRequestIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"swapRequestIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BigInt"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"requests"},"name":{"kind":"Name","value":"allLiquidationSwapRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"swapRequestId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"swapRequestIds"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"EnumValue","value":"SWAP_REQUEST_ID_ASC"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"swapRequestId"}},{"kind":"Field","name":{"kind":"Name","value":"completedAtEventId"}},{"kind":"Field","name":{"kind":"Name","value":"abortedAtEventId"}},{"kind":"Field","name":{"kind":"Name","value":"loanByLoanId"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetLiquidationStatusBySwapRequestIdsQuery, GetLiquidationStatusBySwapRequestIdsQueryVariables>;