import { addWeeks } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';
import { lpClient } from '../../server.js';
import getLpFills from '../lpFills.js';

describe('getLpFills', () => {
  it('returns all the lp fills for given range', async () => {
    const start = '2024-10-31T00:00:00Z';
    const end = addWeeks(start, 1).toISOString();
    expect(await getLpFills({ start, end })).toMatchInlineSnapshot(`
      [
        {
          "alias": "JIT Strategies",
          "filledAmountValueUsd": "25334355.6646832458",
          "idSs58": "cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh",
          "percentage": "42.15",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": "ChainflipGod",
          "filledAmountValueUsd": "9833398.3587926122",
          "idSs58": "cFMVQrUbuTuXmeRinPQovRkCgoyrrRd3N4Q5ZdHfqv4VJi5Hh",
          "percentage": "16.36",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": "Selini",
          "filledAmountValueUsd": "9434345.0577949431",
          "idSs58": "cFLGvPhhrribWCx9id5kLVqwiFK4QiVNjQ6ViyaRFF2Nrgq7j",
          "percentage": "15.70",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": "Auros",
          "filledAmountValueUsd": "6822847.1335449754",
          "idSs58": "cFJXT4WEEdfiShje4z9JMwAvMiMTu7nioPgXsE9o1KqdVrzLg",
          "percentage": "11.35",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "5187912.6660176357",
          "idSs58": "cFJYzUFU97Y849kbKvyj7br1CUumnbqWHJKDcfPFoKRqq6Zxz",
          "percentage": "8.63",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": "TreStylez",
          "filledAmountValueUsd": "1838852.595176714",
          "idSs58": "cFKy4xbhLxvAVxYuPEWbbTJTed5WtyqNVikH2fS2WYLNHRrFh",
          "percentage": "3.06",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": "curiouspleb",
          "filledAmountValueUsd": "673831.4974354201",
          "idSs58": "cFPJNbXH9KNP1CRejnf19ARopcS8w8c4teTz5GF3G36MZRWJG",
          "percentage": "1.12",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": "CumpsD",
          "filledAmountValueUsd": "639320.1970485001",
          "idSs58": "cFLBKavxvThwqLWNr7cTwtqhYD6jDqXM31d6QoTLvuK4X78ve",
          "percentage": "1.06",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "113189.5295014113",
          "idSs58": "cFNyp1zp93cBrHnsPjSpgc2JGwGmiQbtrrTNRNeZteRkb3Ud4",
          "percentage": "0.19",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": "Gonzo",
          "filledAmountValueUsd": "78889.5914538513",
          "idSs58": "cFLZS9GDX4CeXWdjqm2sXmVUNqW1H71BK5nfUXHo6qtKDqNHu",
          "percentage": "0.13",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "63762.9081250957",
          "idSs58": "cFPV6R6vXWAXVityn3XAZNMQDkuZ96LcmS2euYYrGjchWWAri",
          "percentage": "0.11",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "53282.2657452464",
          "idSs58": "cFJtLQCKAGqSpamy1R9W4efQHaq5PhKSK93ucVRZMJq6ute8F",
          "percentage": "0.09",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": "Marky",
          "filledAmountValueUsd": "15717.8377395582",
          "idSs58": "cFK6qCSmgYJACMNVk6JnCb5nkccr7yM6aZiKtXUnFAzsX7hvs",
          "percentage": "0.03",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "9938.1818879375",
          "idSs58": "cFHw1UHP69RiSSj5FSYRx5e4Fuh4qg4625zBxW2XbE4wK6JTL",
          "percentage": "0.02",
          "type": "LIQUIDITY_PROVIDER",
        },
      ]
    `);
  });

  it('only returns a list of lps with a percentage greater than 0%', async () => {
    vi.spyOn(lpClient, 'request').mockResolvedValueOnce({
      limitOrders: {
        groupedAggregates: [
          {
            keys: ['2'],
            sum: {
              filledAmountValueUsd: '0.0000005',
            },
          },
          {
            keys: ['3'],
            sum: {
              filledAmountValueUsd: '3',
            },
          },
        ],
      },
      rangeOrders: {
        groupedAggregates: [
          {
            keys: ['2'],
            sum: {
              baseFilledAmountValueUsd: '0.00000001',
              quoteFilledAmountValueUsd: '0.00000001',
            },
          },
          {
            keys: ['3'],
            sum: {
              baseFilledAmountValueUsd: '1',
              quoteFilledAmountValueUsd: '1',
            },
          },
        ],
      },
    });

    const start = '2024-10-31T00:00:00Z';
    const end = addWeeks(start, 1).toISOString();
    const result = await getLpFills({ start, end });

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "alias": "Auros",
          "filledAmountValueUsd": "5",
          "idSs58": "cFJXT4WEEdfiShje4z9JMwAvMiMTu7nioPgXsE9o1KqdVrzLg",
          "percentage": "100.00",
          "type": "LIQUIDITY_PROVIDER",
        },
      ]
    `);
  });

  it('should correctly sort lpFills by filledAmountValueUsd in descennding order', async () => {
    vi.spyOn(lpClient, 'request').mockResolvedValueOnce({
      limitOrders: {
        groupedAggregates: [
          {
            keys: ['1'],
            sum: {
              filledAmountValueUsd: '1',
            },
          },
          {
            keys: ['2'],
            sum: {
              filledAmountValueUsd: '1',
            },
          },
          {
            keys: ['3'],
            sum: {
              filledAmountValueUsd: '3',
            },
          },
        ],
      },
      rangeOrders: {
        groupedAggregates: [
          {
            keys: ['2'],
            sum: {
              baseFilledAmountValueUsd: '1',
              quoteFilledAmountValueUsd: '1',
            },
          },
          {
            keys: ['3'],
            sum: {
              baseFilledAmountValueUsd: '0.5',
              quoteFilledAmountValueUsd: '0.5',
            },
          },
        ],
      },
    });

    const start = '2024-10-31T00:00:00Z';
    const end = addWeeks(start, 1).toISOString();
    const result = await getLpFills({ start, end });

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "alias": "Auros",
          "filledAmountValueUsd": "4",
          "idSs58": "cFJXT4WEEdfiShje4z9JMwAvMiMTu7nioPgXsE9o1KqdVrzLg",
          "percentage": "50.00",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": "JIT Strategies",
          "filledAmountValueUsd": "3",
          "idSs58": "cFNzKSS48cZ1xQmdub2ykc2LUc5UZS2YjLaZBUvmxoXHjMMVh",
          "percentage": "37.50",
          "type": "LIQUIDITY_PROVIDER",
        },
        {
          "alias": undefined,
          "filledAmountValueUsd": "1",
          "idSs58": "cFKjURUE4jdxHgcKb4uBnKiY9Pkx2yuvQuRVfTDFh5j5eUgyN",
          "percentage": "12.50",
          "type": "LIQUIDITY_PROVIDER",
        },
      ]
    `);
  });
});
