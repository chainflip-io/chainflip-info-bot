import { describe, expect, it, vi } from 'vitest';
import lpFills from './lpFIlls.json' with { type: 'json' };
import { lpClient } from '../../server.js';
import getLpFills from '../lpFills.js';

describe('getLpFills', () => {
  it('returns all the lp fills for given range', async () => {
    vi.mocked(lpClient.request)
      .mockResolvedValueOnce(lpFills)
      .mockResolvedValueOnce({
        accounts: {
          nodes: [
            {
              id: 2,
              idSs58: 'cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh',
            },
            {
              id: 3,
              idSs58: 'cFJXT4WEEdfiShje4z9JMwAvMiMTu7nioPgXsE9o1KqdVrzLg',
            },
            {
              id: 7,
              idSs58: 'cFLGvPhhrribWCx9id5kLVqwiFK4QiVNjQ6ViyaRFF2Nrgq7j',
            },
            {
              id: 9,
              idSs58: 'cFKZarxpf9MVwzzmYUtQfV61PRkYgTj9wUgUCeuKpKgMLrTow',
            },
            {
              id: 27,
              idSs58: 'cFLBKavxvThwqLWNr7cTwtqhYD6jDqXM31d6QoTLvuK4X78ve',
            },
            {
              id: 34,
              idSs58: 'cFK6qCSmgYJACMNVk6JnCb5nkccr7yM6aZiKtXUnFAzsX7hvs',
            },
            {
              id: 36,
              idSs58: 'cFKy4xbhLxvAVxYuPEWbbTJTed5WtyqNVikH2fS2WYLNHRrFh',
            },
            {
              id: 44,
              idSs58: 'cFN5mkvi3yA9kgzVz4qfri23bwKjd9YTrykqLv6rZsik4HBHz',
            },
            {
              id: 53,
              idSs58: 'cFPV6R6vXWAXVityn3XAZNMQDkuZ96LcmS2euYYrGjchWWAri',
            },
            {
              id: 57,
              idSs58: 'cFNgY2xnF9jvLLJ9TTtFwVTUCoo9aAX26UveiN7NftzkhEyYW',
            },
            {
              id: 70,
              idSs58: 'cFMVQrUbuTuXmeRinPQovRkCgoyrrRd3N4Q5ZdHfqv4VJi5Hh',
            },
            {
              id: 79,
              idSs58: 'cFNyp1zp93cBrHnsPjSpgc2JGwGmiQbtrrTNRNeZteRkb3Ud4',
            },
            {
              id: 103,
              idSs58: 'cFHw1UHP69RiSSj5FSYRx5e4Fuh4qg4625zBxW2XbE4wK6JTL',
            },
            {
              id: 109,
              idSs58: 'cFJYzUFU97Y849kbKvyj7br1CUumnbqWHJKDcfPFoKRqq6Zxz',
            },
            {
              id: 118,
              idSs58: 'cFMTFP2F61oRQGf7rUZpD2gaNtEjH65Sm6xhay4xmgBcwD26a',
            },
            {
              id: 131,
              idSs58: 'cFNAnhKPq7hnCKBM2rgo7v7WyroRsZiKm9gKSoPcggdyfYwaA',
            },
            {
              id: 151,
              idSs58: 'cFLq5LwQENkHjHuucTZEFYU6DeESbuAkcKVPpM69mx8YKY6yc',
            },
          ],
        },
      });

    const start = '2022-01-01T00:00:00Z';
    const end = '2022-01-07T00:00:00Z';
    expect(await getLpFills({ start, end })).toMatchInlineSnapshot(`
      [
        {
          "alias": "JIT Strategies",
          "filledAmountValueUsd": "3403017.236955578",
          "idSs58": "cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh",
          "percentage": "48.18",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "1299633.3441712966",
          "idSs58": "cFJYzUFU97Y849kbKvyj7br1CUumnbqWHJKDcfPFoKRqq6Zxz",
          "percentage": "18.40",
        },
        {
          "alias": "ChainflipGod",
          "filledAmountValueUsd": "668227.3696497927",
          "idSs58": "cFMVQrUbuTuXmeRinPQovRkCgoyrrRd3N4Q5ZdHfqv4VJi5Hh",
          "percentage": "9.46",
        },
        {
          "alias": "Auros",
          "filledAmountValueUsd": "573330.7181606164",
          "idSs58": "cFJXT4WEEdfiShje4z9JMwAvMiMTu7nioPgXsE9o1KqdVrzLg",
          "percentage": "8.12",
        },
        {
          "alias": "Selini",
          "filledAmountValueUsd": "511394.1558238848",
          "idSs58": "cFKZarxpf9MVwzzmYUtQfV61PRkYgTj9wUgUCeuKpKgMLrTow",
          "percentage": "7.24",
        },
        {
          "alias": "TreStylez",
          "filledAmountValueUsd": "377071.4615828053",
          "idSs58": "cFKy4xbhLxvAVxYuPEWbbTJTed5WtyqNVikH2fS2WYLNHRrFh",
          "percentage": "5.34",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "122931.3197604075",
          "idSs58": "cFNgY2xnF9jvLLJ9TTtFwVTUCoo9aAX26UveiN7NftzkhEyYW",
          "percentage": "1.74",
        },
        {
          "alias": "Selini",
          "filledAmountValueUsd": "34494.7571256542",
          "idSs58": "cFLGvPhhrribWCx9id5kLVqwiFK4QiVNjQ6ViyaRFF2Nrgq7j",
          "percentage": "0.49",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "34223.7176464613",
          "idSs58": "cFN5mkvi3yA9kgzVz4qfri23bwKjd9YTrykqLv6rZsik4HBHz",
          "percentage": "0.48",
        },
        {
          "alias": "CumpsD",
          "filledAmountValueUsd": "23075.3036937412",
          "idSs58": "cFLBKavxvThwqLWNr7cTwtqhYD6jDqXM31d6QoTLvuK4X78ve",
          "percentage": "0.33",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "9315.4878050389",
          "idSs58": "cFNyp1zp93cBrHnsPjSpgc2JGwGmiQbtrrTNRNeZteRkb3Ud4",
          "percentage": "0.13",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "2990.8296020024",
          "idSs58": "cFPV6R6vXWAXVityn3XAZNMQDkuZ96LcmS2euYYrGjchWWAri",
          "percentage": "0.04",
        },
        {
          "alias": "Marky",
          "filledAmountValueUsd": "2230.8860109957",
          "idSs58": "cFK6qCSmgYJACMNVk6JnCb5nkccr7yM6aZiKtXUnFAzsX7hvs",
          "percentage": "0.03",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "717.5474369074",
          "idSs58": "cFLq5LwQENkHjHuucTZEFYU6DeESbuAkcKVPpM69mx8YKY6yc",
          "percentage": "0.01",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "461.8546832861",
          "idSs58": "cFMTFP2F61oRQGf7rUZpD2gaNtEjH65Sm6xhay4xmgBcwD26a",
          "percentage": "0.01",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "190.624156137",
          "idSs58": "cFHw1UHP69RiSSj5FSYRx5e4Fuh4qg4625zBxW2XbE4wK6JTL",
          "percentage": "0.00",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "34.4975149188",
          "idSs58": "cFNAnhKPq7hnCKBM2rgo7v7WyroRsZiKm9gKSoPcggdyfYwaA",
          "percentage": "0.00",
        },
      ]
    `);

    expect(lpClient.request).toHaveBeenCalledWith(expect.anything(), { start, end });
  });
});
