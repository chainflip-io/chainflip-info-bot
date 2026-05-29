import { ChainflipAsset } from '@chainflip/utils/chainflip';
import { abbreviate } from '@chainflip/utils/string';
import BigNumber from 'bignumber.js';
import { hoursToMilliseconds } from 'date-fns';
import { DispatchJobArgs, JobConfig, JobProcessor } from './initialize.js';
import {
  Bold,
  ExplorerLink,
  Line,
  renderForPlatform,
  TokenAmount,
  Trailer,
  UsdValue,
} from '../channels/formatting.js';
import { platforms } from '../config.js';
import { LendingPoolBalanceChangeType } from '../graphql/generated/lp/graphql.js';
import getLatestLendingLiquidityChangeId from '../queries/getLatestLendingLiquidityChangeId.js';
import getNewLendingLiquidityChange from '../queries/getNewLendingLiquidityChange.js';
import logger from '../utils/logger.js';

const name = 'newLendingLiquidityChangeCheck';
type Name = typeof name;

type Data = {
  lastCheckedLendingLiquidityChangeId: number;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

const INTERVAL = 30_000;

export const getNextJobData = async (
  lendingLiquidityChangeId: number | null,
): Promise<Extract<DispatchJobArgs, { name: 'scheduler' }>> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newLendingLiquidityChangeCheck';

  return {
    name: 'scheduler',
    data: [
      {
        name,
        data: {
          lastCheckedLendingLiquidityChangeId:
            lendingLiquidityChangeId ?? (await getLatestLendingLiquidityChangeId()),
        },
        opts: { attempts: 720, backoff: { delay: 5_000, type: 'fixed' } },
      },
    ],
    opts: { delay: INTERVAL, deduplication: { id: customJobId } },
  };
};

const buildMessages = ({
  type,
  accountIdSs58,
  amount,
  amountValueUsd,
  asset,
}: {
  type: LendingPoolBalanceChangeType;
  accountIdSs58: string | undefined;
  amount: BigNumber;
  amountValueUsd: BigNumber | null;
  asset: Exclude<ChainflipAsset, 'Dot'>;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] => {
  const typeValue = type === 'MANUAL_DEPOSIT' ? 'Supply' : 'Withdrawal';
  const filterName = type === 'MANUAL_DEPOSIT' ? 'NEW_DEPOSIT' : 'NEW_WITHDRAWAL';

  return platforms.map((platform) => ({
    name: 'messageRouter' as const,
    data: {
      platform,
      message: renderForPlatform(
        platform,
        <>
          <Line>🏦 Lending pool transaction</Line>
          {accountIdSs58 && (
            <Line>
              👤 Account:{' '}
              <Bold>
                <ExplorerLink path={`/lps/${accountIdSs58}`} prefer="link">
                  {abbreviate(accountIdSs58, 8)}
                </ExplorerLink>
              </Bold>
            </Line>
          )}
          <Line>
            💳 Type: <Bold>{typeValue}</Bold>
          </Line>
          <Line>
            📥 Amount:{' '}
            <Bold>
              <TokenAmount amount={amount} asset={asset} />
            </Bold>
            <UsdValue amount={amountValueUsd} />
          </Line>
          <Trailer />
        </>,
      ).trimEnd(),
      filterData: { name: filterName, usdValue: amountValueUsd?.toNumber() || 0 },
    },
  }));
};

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info('Checking for new lending liquidity change', job.data);
  const lendingLiquidityChange = await getNewLendingLiquidityChange(
    job.data.lastCheckedLendingLiquidityChangeId,
  );

  const jobs: DispatchJobArgs[] = [
    await getNextJobData(
      lendingLiquidityChange?.id ?? job.data.lastCheckedLendingLiquidityChangeId,
    ),
  ];

  if (lendingLiquidityChange) {
    const { id, type, amount, amountValueUsd, asset, accountByLiquidityProviderId, timestamp } =
      lendingLiquidityChange;

    // We just want to send the message if the lending liquidity change happened in the last 12 hours
    if (Date.now() - new Date(timestamp).getTime() <= hoursToMilliseconds(12)) {
      jobs.push(
        ...buildMessages({
          type,
          amount,
          amountValueUsd,
          asset: asset as Exclude<ChainflipAsset, 'Dot'>,
          accountIdSs58: accountByLiquidityProviderId?.idSs58,
        }),
      );
      logger.info(`Send message about lending liquidity ${type}`);
    } else logger.warn(`Lending liquidity change ${type} with id ${id} exceeded max age threshold`);
  }

  await dispatchJobs(jobs);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
