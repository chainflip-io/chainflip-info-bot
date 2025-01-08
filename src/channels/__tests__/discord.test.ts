import { Client, type TextChannel } from 'discord.js';
import { vi, describe, it, expect } from 'vitest';
import { client, login, sendMessage } from '../discord.js';

describe('sendMessage', () => {
  it('sends a message to the channel', async () => {
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

    await sendMessage(
      {
        token: 'discord:discord_1',
        channelId: 'channel1',
      },
      'Hello, world!',
    );

    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(loginSpy).toHaveBeenCalledWith('discord:discord_1');
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith('Hello, world!');
  });

  it('throws an error if the response is not ok', async () => {
    const loginSpy = vi.spyOn(Client.prototype, 'login');
    loginSpy.mockImplementation(() => {
      client.emit('ready' as never);
      return Promise.resolve('');
    });
    const sendMock = vi.fn().mockRejectedValue('an error occurred');
    vi.spyOn(client.channels.cache, 'get').mockReturnValue({
      isSendable: () => true,
      send: sendMock,
    } as unknown as TextChannel);

    await expect(
      sendMessage(
        {
          token: 'discord:discord_1',
          channelId: 'channel1',
        },
        'Hello, world!',
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"an error occurred"`);

    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(loginSpy).toHaveBeenCalledWith('discord:discord_1');
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith('Hello, world!');
  });

  describe('login', () => {
    it('ensure no unnecessary logins', async () => {
      const loginSpy = vi.spyOn(Client.prototype, 'login');
      const isReadySpy = vi.spyOn(Client.prototype, 'isReady');
      loginSpy.mockImplementation(() => {
        client.emit('ready' as never);
        return Promise.resolve('');
      });

      await login('my-token');

      isReadySpy.mockResolvedValueOnce(true);

      await login('my-token2');

      expect(loginSpy).toHaveBeenCalledTimes(1);
      expect(loginSpy).toHaveBeenCalledWith('my-token');
    });
  });
});
