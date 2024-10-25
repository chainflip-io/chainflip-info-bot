import { subMilliseconds } from 'date-fns';
import { chainConstants, type ChainflipChain } from './chainflip.js';
import { differenceInTimeAgo, intervalToDurationWords } from './date.js';

export const getSwapCompletionTime = ({
  depositChannelCreationTimestamp,
  preDepositBlockTimestamp,
  depositTimestamp,
  egressTimestamp,
  sourceChain,
  exact = true,
}: {
  depositTimestamp: Date;
  egressTimestamp: Date;
  sourceChain: ChainflipChain;
  depositChannelCreationTimestamp?: Date;
  preDepositBlockTimestamp?: Date;
  exact?: boolean;
}) => {
  let millisecondsToSubtract;
  if (preDepositBlockTimestamp) {
    const preDepositTimestamp = depositChannelCreationTimestamp
      ? new Date(
          Math.max(preDepositBlockTimestamp.getTime(), depositChannelCreationTimestamp.getTime()),
        )
      : preDepositBlockTimestamp;

    millisecondsToSubtract = (depositTimestamp.getTime() - preDepositTimestamp.getTime()) / 2;
  } else {
    millisecondsToSubtract = (chainConstants[sourceChain].blockTimeSeconds / 2) * 1000;
  }

  return exact
    ? intervalToDurationWords({
        start: subMilliseconds(depositTimestamp, millisecondsToSubtract).getTime(),
        end: egressTimestamp.getTime(),
      })
    : differenceInTimeAgo(
        subMilliseconds(depositTimestamp, millisecondsToSubtract).toISOString(),
        false,
        egressTimestamp.toISOString(),
      );
};
