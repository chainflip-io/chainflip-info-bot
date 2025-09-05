import { abbreviate } from '@chainflip/utils/string';
import BigNumber from 'bignumber.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { type JobConfig, type DispatchJobArgs, type JobProcessor } from './initialize.js';
import { Bold, ExplorerLink, Line } from '../channels/formatting.js';
import { TokenAmount, UsdValue } from '../channels/formatting.js';
import { platforms } from '../config.js';
import { DelegationActivityType } from '../graphql/generated/explorer/graphql.js';
import { getDelegationActivityByIdQuery } from '../queries/explorer.js';
import { explorerClient } from '../server.js';
import baseLogger from '../utils/logger.js';

const name = 'delegationActivityStatusCheck';
type Name = typeof name;

const logger = baseLogger.child({ queue: name });

type Data = {
  delegationActivityId: number;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

type DelegationActivity = {
  id: number;
  type: DelegationActivityType;
  txHash?: string | null;
  amount: string;
  valueUsd: string;
  operatorId: number;
  operatorAlias?: string | null;
  operatorIdSs58: string;
};

const buildMessageData = ({
  delegationActivityInfo,
}: {
  delegationActivityInfo: DelegationActivity;
}): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] => {
  const { id, operatorAlias, operatorIdSs58, txHash, amount, valueUsd } = delegationActivityInfo;

  return platforms.map((platform) => ({
    name: 'messageRouter' as const,
    data: {
      platform,
      message: renderToStaticMarkup(
        <>
          <Line>
            New delegation detected: <Bold platform={platform}>#{id}</Bold>
          </Line>
          <Line>
            👷‍♂️ Operator:{' '}
            <ExplorerLink platform={platform} path={`/operators/${operatorIdSs58}`} prefer="text">
              {operatorAlias ?? abbreviate(operatorIdSs58)}
            </ExplorerLink>
          </Line>
          <Line>
            📥 Delegated Amount:{' '}
            <Bold platform={platform}>
              <TokenAmount amount={BigNumber(amount)} asset="Flip" />
            </Bold>
            <UsdValue amount={BigNumber(valueUsd)} />
          </Line>
          {txHash && (
            <>
              <Line>
                🧾 Transaction refs:{' '}
                <ExplorerLink path={txHash} chain="Ethereum" platform={platform} prefer="text">
                  {txHash}
                </ExplorerLink>
              </Line>
            </>
          )}
        </>,
      ).trimEnd(),
      filterData: { name: 'NEW_DELEGATION' },
    },
  }));
};

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info(`Checking new delegation activity request #${job.data.delegationActivityId}`);

  const delegationActivitiesQuery = await explorerClient.request(getDelegationActivityByIdQuery, {
    id: job.data.delegationActivityId,
  });

  console.log('delegationActivitiesQuery', delegationActivitiesQuery);

  const delegationActivity = delegationActivitiesQuery.allDelegationActivities?.nodes[0];

  if (!delegationActivity) {
    throw new Error(`Delegation activity not found for id ${job.data.delegationActivityId}`);
  }

  const {
    id,
    type,
    txHash,
    amount,
    valueUsd,
    operatorByOperatorId: {
      id: operatorId,
      accountByAccountId: { alias: operatorAlias, idSs58: operatorIdSs58 },
    },
  } = delegationActivity;

  const delegationActivityInfo = {
    id,
    type,
    txHash,
    amount,
    valueUsd,
    operatorId,
    operatorAlias,
    operatorIdSs58,
  };

  await dispatchJobs(buildMessageData({ delegationActivityInfo }));
};

export const config: JobConfig<typeof name> = {
  name,
  processJob,
};
