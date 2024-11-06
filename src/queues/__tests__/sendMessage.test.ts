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

  it('sends messages to twitter channels', async () => {
    const postSpy = vi
      .mocked(axios.post)
      .mockResolvedValue({ data: { id: '123', text: 'Hello, world!' } });

    await config.processJob(vi.fn())({
      data: {
        key: 'twitter:twitter_1',
        message: 'Hello, world!',
      } as JobData['sendMessage'],
    } as any);

    expect(postSpy.mock.lastCall).toMatchObject([
      'https://api.twitter.com/2/tweets',
      {
        text: 'Hello, world!',
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: expect.stringMatching(
            /OAuth oauth_consumer_key=".+?", oauth_nonce=".+?", oauth_signature=".+?", oauth_signature_method="PLAINTEXT", oauth_timestamp="\d+", oauth_token=".+?", oauth_version="1\.0"/,
          ) as string,
          'Content-Type': 'application/json',
          'User-Agent': 'v2CreateTweetJS',
        },
      },
    ]);
  });
});
