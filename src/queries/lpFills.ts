import { lpAliasMap } from '@chainflip/utils/consts';
import { BigNumber } from 'bignumber.js';
import { gql } from '../graphql/generated/gql.js';
import { lpClient } from '../server.js';

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

export type LPFillsData = {
  idSs58: string | undefined;
  filledAmountValueUsd: BigNumber;
  percentage: string | undefined;
  alias: string | undefined;
};

export default async function getLpFills({
  start,
  end,
}: {
  start: string;
  end: string;
}): Promise<LPFillsData[]> {
  const { limitOrders, rangeOrders } = await lpClient.request(getLpFillsQuery, { start, end });

  const agg =
    limitOrders?.groupedAggregates
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
      .sort((a, b) => b.filledAmountValueUsd.comparedTo(a.filledAmountValueUsd)) ?? [];

  const total = agg.reduce((acc, lp) => acc.plus(lp.filledAmountValueUsd), new BigNumber(0));

  const { accounts } = await lpClient.request(getIdSs58Query, {
    ids: agg?.map((lp) => lp.id) ?? [],
  });

  const groupedByAccount: Record<
    string,
    { filledAmountValueUsd: BigNumber; percentage: string; alias: string }
  > = {};

  agg?.forEach(({ id, ...lp }) => {
    const idSs58 = accounts?.nodes.find((account) => account.id === id)?.idSs58;

    if (idSs58) {
      if (groupedByAccount[idSs58]) {
        groupedByAccount[idSs58].filledAmountValueUsd = groupedByAccount[
          idSs58
        ].filledAmountValueUsd.plus(lp.filledAmountValueUsd);
      } else {
        groupedByAccount[idSs58] = {
          filledAmountValueUsd: lp.filledAmountValueUsd,
          percentage: '0',
          alias: lpAliasMap[idSs58]?.name,
        };
      }
    }
  });

  return Object.keys(groupedByAccount).map((idSs58) => {
    const lp = groupedByAccount[idSs58];
    const percentage = lp.filledAmountValueUsd.dividedBy(total).times(100).toFixed(2);

    return {
      ...lp,
      idSs58,
      percentage,
    };
  });
}
