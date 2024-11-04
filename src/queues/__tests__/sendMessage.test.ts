import axios from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { config } from '../sendMessage.js';

describe('sendMessage', () => {
  it('sends messages to telegram channels', async () => {
    const postSpy = vi.mocked(axios.post).mockResolvedValue({ data: { ok: true } });

    await config.processJob(vi.fn())({
      data: {
        key: 'telegram:telegram_1',
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
        key: 'discord:discord_1',
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
