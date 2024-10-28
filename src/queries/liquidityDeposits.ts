import { gql } from '../graphql/generated/gql.js';
import { client } from '../server.js';

const getNewDepositsQuery = gql(/* GraphQL */ `
  query GetNewLiquididityDeposits($id: Int!) {
    deposits: allLiquidityDeposits(filter: { id: { greaterThan: $id } }, orderBy: ID_ASC) {
      nodes {
        asset
        depositAmount
        depositValueUsd
        liquidityProviderId
      }
    }
  }
`);

export default async function checkForFirstNewLpDeposits(id: number) {
  const { deposits } = await client.request(getNewDepositsQuery, { id });

  if (!deposits?.nodes.length) return [];

  // https://stackoverflow.com/questions/2218999/how-to-remove-all-duplicates-from-an-array-of-objects
  // keep the first deposit of each liquidity provider and filter the rest
  return deposits.nodes.filter(
    (deposit, i) =>
      deposits.nodes.findIndex((d) => d.liquidityProviderId === deposit.liquidityProviderId) === i,
  );
}
