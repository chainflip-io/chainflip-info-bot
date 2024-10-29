import { BigNumber } from 'bignumber.js';
import { gql } from '../graphql/generated/gql.js';
import { lpClient } from '../server.js';

const getLpFillsQuery = gql(/* GraphQL */ `
  query GetLpFills($after: Datetime!) {
    limitOrders: allLimitOrderFills(filter: { blockTimestamp: { greaterThan: $after } }) {
      groupedAggregates(groupBy: LIQUIDITY_PROVIDER_ID) {
        keys
        sum {
          filledAmountValueUsd
        }
      }
    }
    rangeOrders: allRangeOrderFills(filter: { blockTimestamp: { greaterThan: $after } }) {
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

const getIdSs58Query = gql(/* GraphQL */ `
  query GetAccount($ids: [Int!]) {
    accounts: allAccounts(filter: { id: { in: $ids } }) {
      nodes {
        id
        idSs58
      }
    }
  }
`);

export default async function getLpFills({ after }: { after: string }) {
  const { limitOrders, rangeOrders } = await lpClient.request(getLpFillsQuery, { after });

  const agg = limitOrders?.groupedAggregates
    ?.map((group) => {
      const lp = group.keys?.[0];
      return {
        id: Number(group.keys?.[0]),
        filledAmountValueUsd: BigNumber.sum(
          group.sum?.filledAmountValueUsd ?? 0,
          rangeOrders?.groupedAggregates?.find((range) => range.keys?.[0] === lp)?.sum
            ?.baseFilledAmountValueUsd ?? 0,
          rangeOrders?.groupedAggregates?.find((range) => range.keys?.[0] === lp)?.sum
            ?.quoteFilledAmountValueUsd ?? 0,
        ),
      };
    })
    .sort((a, b) => (b.filledAmountValueUsd.gt(a.filledAmountValueUsd) ? 1 : -1));

  const total = agg?.reduce((acc, lp) => acc.plus(lp.filledAmountValueUsd), new BigNumber(0));

  const { accounts } = await lpClient.request(getIdSs58Query, {
    ids: agg?.map((lp) => lp.id) ?? [],
  });

  return agg?.map(({ id, ...lp }) => ({
    ...lp,
    idSs58: accounts?.nodes.find((account) => account.id === id)?.idSs58,
    percentage: total && lp.filledAmountValueUsd.dividedBy(total).times(100).toFixed(2),
  }));
}
