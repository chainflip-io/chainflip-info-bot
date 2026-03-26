import { anyChainConstants, type AnyChainflipChain } from '@chainflip/utils/chainflip';
import { intervalToDurationWords } from '@chainflip/utils/date';
import { subMilliseconds } from 'date-fns';

const EGRESS_BROADCAST_SIGNING_DURATION_MS = 90 * 1000;

export const getSwapCompletionTime = ({
  depositChannelCreationTimestamp,
  preDepositBlockTimestamp,
  depositTimestamp,
  egressTimestamp,
  sourceChain,
}: {
  depositTimestamp: Date;
  egressTimestamp: Date;
  sourceChain: AnyChainflipChain;
  depositChannelCreationTimestamp?: Date;
  preDepositBlockTimestamp?: Date;
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

  const startMs = subMilliseconds(depositTimestamp, millisecondsToSubtract).getTime();
  const endMs = egressTimestamp.getTime() + EGRESS_BROADCAST_SIGNING_DURATION_MS;

  return intervalToDurationWords({ start: startMs, end: endMs });
};
