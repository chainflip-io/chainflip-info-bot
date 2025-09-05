import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { explorerClient } from '../../server.js';
import { config } from '../delegationActivityStatusCheck.js';

const mockGetDelegationActivityByIdQuery = (delegationActivityId: number) => ({
  allDelegationActivities: {
    nodes: [
      {
        id: delegationActivityId,
        type: 'DELEGATE',
        amount: '0',
        valueUsd: '0.000000000000000000000000000000',
        operatorByOperatorId: {
          id: 1,
          accountByAccountId: {
            alias: null,
            idSs58: 'cFMjXCTxTHVkSqbKzeVwJ25TJxLqc1Vn9usPgUGmZhsyvHRQZ',
          },
        },
        txHash: null,
        event: {
          indexInBlock: 21,
          blockId: 436,
          block: {
            timestamp: '2025-09-05T12:43:36+00:00',
          },
        },
      },
    ],
  },
});

describe('delegationActivityStatusCheck', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('check fresh deelgation activity status and send delegation info message', async () => {
    vi.mocked(explorerClient.request).mockResolvedValue(mockGetDelegationActivityByIdQuery(2));

    vi.setSystemTime(new Date('2024-10-25T12:42:30+00:00'));

    const dispatchJobs = vi.fn();

    await config.processJob(dispatchJobs)({
      data: {
        delegationActivityId: 20,
      } as JobData['delegationActivityStatusCheck'],
    } as any);

    expect(dispatchJobs.mock.lastCall).toMatchSnapshot();
  });
});
