import { lpAliasMap } from '@chainflip/utils/consts';
import BigNumber from 'bignumber.js';
import { lpClient } from '../server.js';
import { getLpFillsQuery, getIdSs58Query } from './lp.js';

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
    limitOrders?.groupedAggregates?.map((group) => {
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
    }) ?? [];

  const total = agg.reduce((acc, lp) => acc.plus(lp.filledAmountValueUsd), new BigNumber(0));

  const { accounts } = await lpClient.request(getIdSs58Query, {
    ids: agg?.map((lp) => lp.id) ?? [],
  });

  const groupedByAccountName: Record<
    string,
    { idSs58: string; filledAmountValueUsd: BigNumber; percentage: string; alias?: string }
  > = {};

  agg?.forEach(({ id, ...lp }) => {
    const accountAddress = accounts?.nodes.find((account) => account.id === id)?.idSs58;

    if (!accountAddress) {
      return;
    }

    const name = lpAliasMap[accountAddress]?.name;

    const key = name || accountAddress;

    groupedByAccountName[key] ??= {
      idSs58: accountAddress,
      filledAmountValueUsd: new BigNumber(0),
      percentage: '0',
      alias: name,
    };

    groupedByAccountName[key].filledAmountValueUsd = groupedByAccountName[
      key
    ].filledAmountValueUsd.plus(lp.filledAmountValueUsd);
  });

  return Object.keys(groupedByAccountName)
    .map((accountName) => {
      const lp = groupedByAccountName[accountName];
      const percentage = lp.filledAmountValueUsd.dividedBy(total).times(100).toFixed(2);

      return {
        ...lp,
        percentage,
        alias: lp.alias || undefined,
      };
    })
    .sort((a, b) => b.filledAmountValueUsd.comparedTo(a.filledAmountValueUsd) ?? 0);
}
