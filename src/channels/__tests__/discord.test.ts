import axios from 'axios';
import { vi, describe, it, expect } from 'vitest';
import { sendMessage } from '../discord.js';

describe('sendMessage', () => {
  it('sends a message to the channel', async () => {
    const postMock = vi.mocked(axios.post);

    postMock.mockResolvedValueOnce({ status: 204 });

    await sendMessage({ webhookUrl: 'url' }, 'hello discord bot');

    expect(postMock.mock.lastCall).toMatchInlineSnapshot(`
      [
        "url",
        {
          "content": "hello discord bot",
        },
      ]
    `);
  });

  it('throws an error if the response is not ok', async () => {
    const postMock = vi.mocked(axios.post);

    postMock.mockResolvedValueOnce({
      status: 400,
      data: { ok: false, description: 'some other stuff here' },
    });

    await expect(
      sendMessage({ webhookUrl: 'url' }, 'hello discord bot'),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Failed to send message to discord: {"ok":false,"description":"some other stuff here"}]`,
    );
  });
});
