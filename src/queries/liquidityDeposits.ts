import assert from 'assert';
import { gql } from '../graphql/generated/gql.js';
import { explorerClient } from '../server.js';
import { toTokenAmount } from '../utils/chainflip.js';

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
      }
    }
  }
`);

const checkHasOldDepositQuery = gql(/* GraphQL */ `
  query CheckHasOldDeposit($id: Int!, $liquidityProviderId: Int!) {
    deposits: allLiquidityDeposits(
      filter: { id: { lessThan: $id }, liquidityProviderId: { equalTo: $liquidityProviderId } }
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
  asset: string;
  depositAmount: string;
  depositValueUsd: string;
  lpIdSs58: string;
};

export default async function checkForFirstNewLpDeposits(id: number): Promise<NewDeposit[]> {
  const { deposits } = await explorerClient.request(getNewDepositsQuery, { id });

  if (!deposits?.nodes.length) return [];

  // https://stackoverflow.com/questions/2218999/how-to-remove-all-duplicates-from-an-array-of-objects
  // keep the first deposit of each liquidity provider and filter the rest
  const uniqueLpDeposits = deposits.nodes.filter(
    (deposit, i) => deposits.nodes.findIndex((d) => d.lp.id === deposit.lp.id) === i,
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
            depositAmount: toTokenAmount(uniqueDeposit.depositAmount, uniqueDeposit.asset),
            lpIdSs58: uniqueDeposit.lp.account.idSs58,
          };
    }),
  );

  return checkedDeposits.filter(Boolean) as NewDeposit[];
}
