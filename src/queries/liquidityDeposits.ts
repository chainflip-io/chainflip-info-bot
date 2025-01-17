import { isNotNullish } from '@chainflip/utils/guard';
import assert from 'assert';
import { gql } from '../graphql/generated/gql.js';
import { type ChainflipAsset } from '../graphql/generated/graphql.js';
import { explorerClient } from '../server.js';
import { toFormattedAmount } from '../utils/chainflip.js';

const getNewDepositsQuery = gql(/* GraphQL */ `
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

const checkHasOldDepositQuery = gql(/* GraphQL */ `
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

const getLatestDepositIdQuery = gql(/* GraphQL */ `
  query GetLatestDepositId {
    deposits: allLiquidityDeposits(first: 1, orderBy: ID_DESC) {
      nodes {
        id
      }
    }
  }
`);

export const getLatestDepositId = async () => {
  const result = await explorerClient.request(getLatestDepositIdQuery);
  const depositId = result.deposits?.nodes[0].id;

  assert(depositId, 'No liquidity deposit found');

  return depositId;
};

export type NewDeposit = {
  asset: ChainflipAsset;
  depositAmount: string;
  depositValueUsd: string;
  lpIdSs58: string;
  timestamp: string;
};

export default async function checkForFirstNewLpDeposits(id: number): Promise<NewDeposit[]> {
  const { deposits: newDeposits } = await explorerClient.request(getNewDepositsQuery, { id });

  if (!newDeposits?.nodes.length) return [];

  // https://stackoverflow.com/questions/2218999/how-to-remove-all-duplicates-from-an-array-of-objects
  // keep the first deposit of each liquidity provider and filter the rest
  const uniqueLpDeposits = newDeposits.nodes.filter(
    (deposit, i) => newDeposits.nodes.findIndex((d) => d.lp.id === deposit.lp.id) === i,
  );

  const checkedDeposits = await Promise.all(
    uniqueLpDeposits.map(async (uniqueDeposit) => {
      const { deposits } = await explorerClient.request(checkHasOldDepositQuery, {
        id,
        liquidityProviderId: uniqueDeposit.lp.id,
      });

      return deposits?.nodes && deposits.nodes.length > 0
        ? undefined
        : {
            ...uniqueDeposit,
            depositAmount: toFormattedAmount(uniqueDeposit.depositAmount, uniqueDeposit.asset),
            lpIdSs58: uniqueDeposit.lp.account.idSs58,
            timestamp: uniqueDeposit.event.block.timestamp,
          };
    }),
  );

  return checkedDeposits.filter(isNotNullish);
}
