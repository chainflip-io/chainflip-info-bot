/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it } from 'vitest';
import { getSwapCompletionTime } from '../swaps';

describe('getSwapCompletionTime', () => {
  describe('swap completion time estimate based on statically defined pre-block time intervals', () => {
    it.each([
      ['Ethereum', new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:05:00Z')] as const,
      ['Bitcoin', new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:05:00Z')] as const,
      ['Arbitrum', new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:05:00Z')] as const,
      ['Polkadot', new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:05:00Z')] as const,
    ])(
      `returns an exact swap completion time estimate for %s`,
      (sourceChain, depositTimestamp, egressTimestamp) => {
        const completionTime = getSwapCompletionTime({
          depositTimestamp,
          egressTimestamp,
          sourceChain,
        });

        expect(completionTime).toMatchSnapshot();
      },
    );
    it.each([
      ['Ethereum', new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:05:00Z')] as const,
      ['Bitcoin', new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:05:00Z')] as const,
      ['Arbitrum', new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:05:00Z')] as const,
      ['Polkadot', new Date('2022-01-01T00:00:00Z'), new Date('2022-01-01T00:05:00Z')] as const,
    ])(
      `returns a truncated swap completion time estimate for %s`,
      (sourceChain, depositTimestamp, egressTimestamp) => {
        const completionTime = getSwapCompletionTime({
          depositTimestamp,
          egressTimestamp,
          sourceChain,
          exact: false,
        });

        expect(completionTime).toMatchSnapshot();
      },
    );
  });

  describe('swap completion time estimate based on dynamically defined pre-block time intervals', () => {
    it.each([
      [
        'Ethereum',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Bitcoin',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Arbitrum',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Polkadot',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
    ])(
      `returns an exact swap completion time estimate for %s`,
      (sourceChain, preDepositBlockTimestamp, depositTimestamp, egressTimestamp) => {
        const completionTime = getSwapCompletionTime({
          preDepositBlockTimestamp,
          depositTimestamp,
          egressTimestamp,
          sourceChain,
        });

        expect(completionTime).toMatchSnapshot();
      },
    );
    it.each([
      [
        'Ethereum',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Bitcoin',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Arbitrum',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Polkadot',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
    ])(
      `returns a truncated swap completion time estimate for %s`,
      (sourceChain, preDepositBlockTimestamp, depositTimestamp, egressTimestamp) => {
        const completionTime = getSwapCompletionTime({
          preDepositBlockTimestamp,
          depositTimestamp,
          egressTimestamp,
          sourceChain,
          exact: false,
        });

        expect(completionTime).toMatchSnapshot();
      },
    );
  });
  describe('swap completion time estimate based on dynamically defined pre-block time intervals using channel creation timestamp', () => {
    it.each([
      [
        'Ethereum',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:30Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Bitcoin',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:30Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Arbitrum',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:30Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Polkadot',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:30Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
    ])(
      `returns an exact swap completion time estimate for %s`,
      (
        sourceChain,
        preDepositBlockTimestamp,
        depositChannelCreationTimestamp,
        depositTimestamp,
        egressTimestamp,
      ) => {
        const completionTime = getSwapCompletionTime({
          depositChannelCreationTimestamp,
          preDepositBlockTimestamp,
          depositTimestamp,
          egressTimestamp,
          sourceChain,
        });

        expect(completionTime).toMatchSnapshot();
      },
    );
    it.each([
      [
        'Ethereum',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:30Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Bitcoin',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:30Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Arbitrum',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:30Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Polkadot',
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:30Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
    ])(
      `returns a truncated swap completion time estimate for %s`,
      (
        sourceChain,
        preDepositBlockTimestamp,
        depositChannelCreationTimestamp,
        depositTimestamp,
        egressTimestamp,
      ) => {
        const completionTime = getSwapCompletionTime({
          depositChannelCreationTimestamp,
          preDepositBlockTimestamp,
          depositTimestamp,
          egressTimestamp,
          sourceChain,
          exact: false,
        });

        expect(completionTime).toMatchSnapshot();
      },
    );
  });
  describe('swap completion time estimate based on dynamically defined pre-block time intervals using pre deposit block timestamp', () => {
    it.each([
      [
        'Ethereum',
        new Date('2021-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Bitcoin',
        new Date('2021-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Arbitrum',
        new Date('2021-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Polkadot',
        new Date('2021-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
    ])(
      `returns an exact swap completion time estimate for %s`,
      (
        sourceChain,
        depositChannelCreationTimestamp,
        preDepositBlockTimestamp,
        depositTimestamp,
        egressTimestamp,
      ) => {
        const completionTime = getSwapCompletionTime({
          depositChannelCreationTimestamp,
          preDepositBlockTimestamp,
          depositTimestamp,
          egressTimestamp,
          sourceChain,
        });

        expect(completionTime).toMatchSnapshot();
      },
    );
    it.each([
      [
        'Ethereum',
        new Date('2021-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Bitcoin',
        new Date('2021-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Arbitrum',
        new Date('2021-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
      [
        'Polkadot',
        new Date('2021-01-01T00:00:00Z'),
        new Date('2022-01-01T00:00:00Z'),
        new Date('2022-01-01T00:01:00Z'),
        new Date('2022-01-01T00:05:00Z'),
      ] as const,
    ])(
      `returns a truncated swap completion time estimate for %s`,
      (
        sourceChain,
        depositChannelCreationTimestamp,
        preDepositBlockTimestamp,
        depositTimestamp,
        egressTimestamp,
      ) => {
        const completionTime = getSwapCompletionTime({
          depositChannelCreationTimestamp,
          preDepositBlockTimestamp,
          depositTimestamp,
          egressTimestamp,
          sourceChain,
          exact: false,
        });

        expect(completionTime).toMatchSnapshot();
      },
    );
  });
});
