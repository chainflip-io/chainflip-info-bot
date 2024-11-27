import axios from 'axios';
import { Client, type TextChannel } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';
import { client } from '../../channels/discord.js';
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
    const loginSpy = vi.spyOn(Client.prototype, 'login');
    loginSpy.mockImplementation(() => {
      client.emit('ready' as never);
      return Promise.resolve('');
    });
    const sendMock = vi.fn().mockResolvedValueOnce(true);
    vi.spyOn(client.channels.cache, 'get').mockReturnValue({
      isSendable: () => true,
      send: sendMock,
    } as unknown as TextChannel);

    const dispatchJobsMock = vi.fn();
    await config.processJob(dispatchJobsMock)({
      data: {
        key: 'discord:discord_1',
        message: 'Hello, world!',
      } as JobData['sendMessage'],
    } as any);

    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(loginSpy).toHaveBeenCalledWith('discord bot token');
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith('Hello, world!');
    expect(dispatchJobsMock).toHaveBeenCalledTimes(0);
  });

  it('fails to send message to incorrect discord channel', async () => {
    const loginSpy = vi.spyOn(Client.prototype, 'login');
    loginSpy.mockImplementation(() => {
      client.emit('ready' as never);
      return Promise.resolve('');
    });
    const sendMock = vi.fn();
    vi.spyOn(client.channels.cache, 'get').mockReturnValue({
      isSendable: () => false,
      send: sendMock,
    } as unknown as TextChannel);

    await expect(
      config.processJob(vi.fn())({
        data: {
          key: 'discord:discord_1',
          message: 'Hello, world!',
        } as JobData['sendMessage'],
      } as any),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Channel not found: discord channel id 1]`,
    );

    expect(sendMock).toHaveBeenCalledTimes(0);
    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(loginSpy).toHaveBeenCalledWith('discord bot token');
  });

  it('sends long message to discord channels with replies', async () => {
    const loginSpy = vi.spyOn(Client.prototype, 'login');
    loginSpy.mockImplementation(() => {
      client.emit('ready' as never);
      return Promise.resolve('');
    });
    const sendMock = vi.fn().mockResolvedValueOnce(true);
    vi.spyOn(client.channels.cache, 'get').mockReturnValue({
      isSendable: () => true,
      send: sendMock,
    } as unknown as TextChannel);

    const dispatchJobsMock = vi.fn();
    await config.processJob(dispatchJobsMock)({
      data: {
        key: 'discord:discord_1',
        message: 'HelloWorld'
          .repeat(40)
          .concat('\n')
          .concat('HelloWorld2'.repeat(40).concat('\n'))
          .concat('HelloWorld3'.repeat(40).concat('\n'))
          .concat('HelloWorld4'.repeat(40).concat('\n'))
          .concat('HelloWorld5'.repeat(40).concat('\n'))
          .concat('Hello, world3!\n'.repeat(10))
          .concat('Hello, world4!\n'.repeat(3)),
      } as JobData['sendMessage'],
    } as any);

    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(loginSpy).toHaveBeenCalledWith('discord bot token');
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      'HelloWorld'
        .repeat(40)
        .concat('\n')
        .concat('HelloWorld2'.repeat(40).concat('\n'))
        .concat('HelloWorld3'.repeat(40).concat('\n'))
        .concat('HelloWorld4'.repeat(40).concat('\n'))
        .concat('HelloWorld5'.repeat(40).concat('\n'))
        .concat('Hello, world3!\n'.repeat(4))
        .concat('Hello, world3!'),
    );
    expect(dispatchJobsMock).toHaveBeenCalledTimes(1);
    expect(dispatchJobsMock).toHaveBeenCalledWith([
      {
        data: {
          key: 'discord:discord_1',
          message: 'Hello, world3!\n'.repeat(5).concat('Hello, world4!\n'.repeat(3)),
          replyToId: undefined,
        },
        name: 'sendMessage',
      },
    ]);
  });

  it('sends messages to twitter channels', async () => {
    const postSpy = vi
      .mocked(axios.post)
      .mockResolvedValue({ data: { data: { id: '123', text: 'Hello, world!' } } });

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
