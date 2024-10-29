import { describe, expect, it } from 'vitest';
import { abbreviate } from '../strings';

describe('abbreviate', () => {
  it.each([
    ['', ''],
    [null, ''],
    [undefined, ''],
    ['0x4c9b02c3575767a9290ff01d94851fea36def106', '0x4c…f106'],
  ])('displays edited string', (text, expected) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(abbreviate(text)).toBe(expected);
  });

  it.each([
    ['', ''],
    [null, ''],
    [undefined, ''],
    ['0x4c9b02c3575767a9290ff01d94851fea36def106', '0x4…106'],
  ])('displays edited string with show length param', (text, expected) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(abbreviate(text, 3)).toBe(expected);
  });

  it.each([
    ['', ''],
    [null, ''],
    [undefined, ''],
    ['0x4c9b02c3575767a9290ff01d94851fea36def106', '0x. . .06'],
  ])('displays edited string with show length and space params', (text, expected) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    expect(abbreviate(text, 2, true)).toBe(expected);
  });
});
