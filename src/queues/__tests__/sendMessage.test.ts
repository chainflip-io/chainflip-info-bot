import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { config } from '../sendMessage.js';

describe('sendMessage', () => {
  it('sends messages to telegram channels', async () => {
    const postSpy = vi.mocked(axios.post).mockResolvedValue({ data: { ok: true } });

    await config.processJob(vi.fn())({
      data: {
        key: 'telegram:3b73ae864df5a093acbcd9157c80c508d9b3f4b8',
        message: 'Hello, world!',
      } as JobData['sendMessage'],
    } as any);

    expect(postSpy.mock.lastCall).toMatchInlineSnapshot(`
      [
        "https://api.telegram.org/botbot token/sendMessage",
        {
          "chat_id": "123",
          "parse_mode": "HTML",
          "text": "Hello, world!",
        },
      ]
    `);
  });

  it('sends messages to discord channels', async () => {
    const postSpy = vi.mocked(axios.post).mockResolvedValue({ status: 204 });

    await config.processJob(vi.fn())({
      data: {
        key: 'discord:c02f7e59411e675118304c2abb7e77980d08a44f',
        message: 'Hello, world!',
      } as JobData['sendMessage'],
    } as any);

    expect(postSpy.mock.lastCall).toMatchInlineSnapshot(`
      [
        "https://discord.com/api/webhooks/1234567890/ABCDEFGHIJKL",
        {
          "content": "Hello, world!",
        },
      ]
    `);
  });
});
