import { anyChainConstants, type AnyChainflipChain } from '@chainflip/utils/chainflip';
import { differenceInTimeAgo, intervalToDurationWords } from '@chainflip/utils/date';
import { subMilliseconds } from 'date-fns';

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
  sourceChain: AnyChainflipChain;
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
    millisecondsToSubtract = (anyChainConstants[sourceChain].blockTimeSeconds / 2) * 1000;
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
