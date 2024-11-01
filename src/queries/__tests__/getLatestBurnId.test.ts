import { describe, expect, it, vi } from 'vitest';
import { explorerClient } from '../../server.js';
import getLatestBurnId from '../getLatestBurnId.js';

describe('getLatestBurnId', () => {
  it('should return the latest burn id', async () => {
    vi.mocked(explorerClient.request).mockResolvedValue({
      burns: {
        nodes: [
          {
            id: 13,
          },
        ],
      },
    });

    expect(await getLatestBurnId()).toEqual(13);

    expect(explorerClient.request).toHaveBeenCalledTimes(1);
  });
});
