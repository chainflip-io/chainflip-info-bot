import { addWeeks } from 'date-fns';
import { describe, expect, it } from 'vitest';
import getLpFills from '../lpFills.js';

describe('getLpFills', () => {
  it.only('returns all the lp fills for given range', async () => {
    const start = '2024-10-31T00:00:00Z';
    const end = addWeeks(start, 1).toISOString();
    expect(await getLpFills({ start, end })).toMatchInlineSnapshot(`
      [
        {
          "alias": "JIT Strategies",
          "filledAmountValueUsd": "25334355.6646832458",
          "idSs58": "cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh",
          "percentage": "42.15",
        },
        {
          "alias": "ChainflipGod",
          "filledAmountValueUsd": "9833398.3587926122",
          "idSs58": "cFMVQrUbuTuXmeRinPQovRkCgoyrrRd3N4Q5ZdHfqv4VJi5Hh",
          "percentage": "16.36",
        },
        {
          "alias": "Selini",
          "filledAmountValueUsd": "9434345.0577949431",
          "idSs58": "cFKZarxpf9MVwzzmYUtQfV61PRkYgTj9wUgUCeuKpKgMLrTow",
          "percentage": "15.70",
        },
        {
          "alias": "Auros",
          "filledAmountValueUsd": "6822847.1335449754",
          "idSs58": "cFJXT4WEEdfiShje4z9JMwAvMiMTu7nioPgXsE9o1KqdVrzLg",
          "percentage": "11.35",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "5187912.6660176357",
          "idSs58": "cFJYzUFU97Y849kbKvyj7br1CUumnbqWHJKDcfPFoKRqq6Zxz",
          "percentage": "8.63",
        },
        {
          "alias": "TreStylez",
          "filledAmountValueUsd": "1838852.595176714",
          "idSs58": "cFKy4xbhLxvAVxYuPEWbbTJTed5WtyqNVikH2fS2WYLNHRrFh",
          "percentage": "3.06",
        },
        {
          "alias": "CumpsD",
          "filledAmountValueUsd": "639320.1970485001",
          "idSs58": "cFLBKavxvThwqLWNr7cTwtqhYD6jDqXM31d6QoTLvuK4X78ve",
          "percentage": "1.06",
        },
        {
          "alias": "curiouspleb",
          "filledAmountValueUsd": "673831.4974354201",
          "idSs58": "cFNgY2xnF9jvLLJ9TTtFwVTUCoo9aAX26UveiN7NftzkhEyYW",
          "percentage": "1.12",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "113189.5295014113",
          "idSs58": "cFNyp1zp93cBrHnsPjSpgc2JGwGmiQbtrrTNRNeZteRkb3Ud4",
          "percentage": "0.19",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "78889.5914538513",
          "idSs58": "cFLZS9GDX4CeXWdjqm2sXmVUNqW1H71BK5nfUXHo6qtKDqNHu",
          "percentage": "0.13",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "63762.9081250957",
          "idSs58": "cFPV6R6vXWAXVityn3XAZNMQDkuZ96LcmS2euYYrGjchWWAri",
          "percentage": "0.11",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "53282.2657452464",
          "idSs58": "cFJtLQCKAGqSpamy1R9W4efQHaq5PhKSK93ucVRZMJq6ute8F",
          "percentage": "0.09",
        },
        {
          "alias": "Marky",
          "filledAmountValueUsd": "15717.8377395582",
          "idSs58": "cFK6qCSmgYJACMNVk6JnCb5nkccr7yM6aZiKtXUnFAzsX7hvs",
          "percentage": "0.03",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "9938.1818879375",
          "idSs58": "cFHw1UHP69RiSSj5FSYRx5e4Fuh4qg4625zBxW2XbE4wK6JTL",
          "percentage": "0.02",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "595.3901395963",
          "idSs58": "cFPQQaEEGnzuZTBg8S3JuhiTu1CTrHXDzKAZfvNrSrjUUQQ1z",
          "percentage": "0.00",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "346.0927553195",
          "idSs58": "cFNAnhKPq7hnCKBM2rgo7v7WyroRsZiKm9gKSoPcggdyfYwaA",
          "percentage": "0.00",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "117.2654259377",
          "idSs58": "cFMTFP2F61oRQGf7rUZpD2gaNtEjH65Sm6xhay4xmgBcwD26a",
          "percentage": "0.00",
        },
      ]
    `);
  });
});
