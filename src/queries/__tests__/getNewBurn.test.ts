import { describe, expect, it, vi } from 'vitest';
import { explorerClient } from '../../server.js';
import getNewBurns from '../getNewBurn.js';

describe('getNewBurns', () => {
  it('should return the latest burn id', async () => {
    vi.mocked(explorerClient.request).mockResolvedValue({
      burns: {
        nodes: [
          {
            id: 11,
            totalAmount: '123456789012345',
            valueUsd: '4.21',
            event: {
              blockId: 1,
              indexInBlock: 1,
              block: {
                timestamp: '2024-10-31T15:15:00.000Z',
              },
            },
          },
        ],
      },
    });

    expect(await getNewBurns(10)).toMatchInlineSnapshot(`
      {
        "event": {
          "block": {
            "timestamp": "2024-10-31T15:15:00.000Z",
          },
          "blockId": 1,
          "indexInBlock": 1,
        },
        "id": 11,
        "totalAmount": "0.000123456789012345",
        "valueUsd": "4.21",
      }
    `);

    expect(explorerClient.request).toHaveBeenCalledTimes(1);
  });
});
