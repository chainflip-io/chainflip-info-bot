import { accountIdToEthereumAddress } from '@chainflip/delegation';
import { abbreviate } from '@chainflip/utils/string';
import { type DispatchJobArgs, type JobConfig, type JobProcessor } from './initialize.js';
import {
  Bold,
  ExplorerLink,
  Line,
  renderForPlatform,
  TokenAmount,
  UsdValue,
} from '../channels/formatting.js';
import { platforms } from '../config.js';
import { DelegationActivityType } from '../graphql/generated/explorer/graphql.js';
import getLatestDelegationActivityId from '../queries/getLatestDelegationActivityIds.js';
import getNewDelegationActivityRequestsQuery from '../queries/getLatestDelegationActivityIds.js';
import { toAssetAmount, toUsdAmount } from '../utils/chainflip.js';
import logger from '../utils/logger.js';

const name = 'newDelegationActivityCheck';
type Name = typeof name;

const INTERVAL = 30_000;

export const getNextJobData = async (
  delegationActivityId: number | null,
): Promise<Extract<DispatchJobArgs, { name: 'scheduler' }>> => {
  // prevents multiple jobs with the same key from being scheduled
  const customJobId = 'newDelegationActivityCheck';

  return {
    name: 'scheduler',
    data: [
      {
        name,
        data: {
          delegationActivityId:
            delegationActivityId ??
            (await getLatestDelegationActivityId({ limit: 1 })).at(0)?.id ??
            0,
        },
      },
    ],
    opts: { delay: INTERVAL, deduplication: { id: customJobId } },
  };
};

type Data = {
  delegationActivityId: number;
};

declare global {
  interface JobData {
    [name]: Data;
  }
}

type DelegationActivity = {
  type: DelegationActivityType;
  txHash?: string | null;
  amount: string;
  valueUsd: string;
  operatorAlias?: string | null;
  operatorIdSs58: string;
  delegatorEvmAddress: `0x${string}`;
};

const getHeadline = (type: DelegationActivityType, amount: BigNumber) => {
  switch (type) {
    case 'BID_CHANGE':
      if (amount.isPositive()) return 'Delegation increased';
      return 'Delegation decreased';
    case 'DELEGATE':
      return 'Delegated to new operator';
    case 'UNDELEGATE':
      return 'Undelegated from operator';
    default:
      throw new Error(`Unhandled delegation activity type: ${type}`);
  }
};

const buildMessageData = (
  delegationActivityInfo: DelegationActivity,
): Extract<DispatchJobArgs, { name: 'messageRouter' }>[] => {
  const { type, operatorAlias, operatorIdSs58, txHash, amount, valueUsd, delegatorEvmAddress } =
    delegationActivityInfo;

  const flipAmount = toAssetAmount(amount, 'Flip');

  return platforms.map((platform) => ({
    name: 'messageRouter' as const,
    data: {
      platform,
      message: renderForPlatform(
        platform,
        <>
          <Line>{getHeadline(type, flipAmount)}</Line>
          <Line>
            🤴 Delegator:{' '}
            <ExplorerLink path={`/addresses/${delegatorEvmAddress}`} prefer="text" chain="Ethereum">
              {abbreviate(delegatorEvmAddress)}
            </ExplorerLink>
          </Line>
          <Line>
            👷‍♂️ Operator:{' '}
            <ExplorerLink path={`/operators/${operatorIdSs58}`} prefer="text">
              {operatorAlias || abbreviate(operatorIdSs58)}
            </ExplorerLink>
          </Line>
          <Line>
            💰 Amount:{' '}
            <Bold>
              <TokenAmount amount={flipAmount.abs()} asset="Flip" hideChain />
            </Bold>
            <UsdValue amount={toUsdAmount(valueUsd).abs()} />
          </Line>
          {txHash && (
            <>
              <Line>
                🧾 Transaction:{' '}
                <ExplorerLink path={txHash} chain="Ethereum" prefer="link">
                  {abbreviate(txHash, 8)}
                </ExplorerLink>
              </Line>
            </>
          )}
        </>,
      ).trimEnd(),
      filterData: { name: 'DELEGATION_EVENT' },
      opts: { disablePreview: true },
    },
  }));
};

const processJob: JobProcessor<Name> = (dispatchJobs) => async (job) => {
  logger.info(
    `Checking for new delegation requests, delegationActivityId: ${job.data.delegationActivityId}`,
    job.data,
  );
  const newActivity = await getNewDelegationActivityRequestsQuery({
    lastId: job.data.delegationActivityId,
  });

  const delegationMessages = newActivity.flatMap((node) => {
    const {
      type,
      txHash,
      amount,
      valueUsd,
      operator: {
        account: { alias: operatorAlias, idSs58: operatorIdSs58 },
      },
      delegator: { idSs58: delegatorIdSs58 },
    } = node;

    return buildMessageData({
      type,
      txHash,
      amount,
      valueUsd,
      operatorAlias,
      operatorIdSs58,
      delegatorEvmAddress: accountIdToEthereumAddress(delegatorIdSs58 as `cF${string}`),
    });
  });

  const latestDelegationActivityId = newActivity.at(0)?.id ?? job.data.delegationActivityId;

  logger.info(`Latest delegation activity id: ${latestDelegationActivityId}`);

  const data = await getNextJobData(latestDelegationActivityId);

  await dispatchJobs([data, ...delegationMessages]);

  logger.info(`Sent messages for ${delegationMessages.length} new delegation events`);
};

export const config: JobConfig<Name> = {
  name,
  processJob,
};
