import { describe, expect, it } from 'vitest';
import { formatAggregator, normalizeAlias } from '../format.js';

describe('normalizeAlias', () => {
  it('strips a trailing emoji (with joiner + modifier) and trims', () => {
    expect(normalizeAlias('HoudiniSwap 🧙‍♂️')).toBe('HoudiniSwap');
  });

  it('strips a leading emoji', () => {
    expect(normalizeAlias('🧙 HoudiniSwap')).toBe('HoudiniSwap');
  });

  it('strips a mid-name emoji and collapses whitespace', () => {
    expect(normalizeAlias('Houdini 🧙 Swap')).toBe('Houdini Swap');
  });

  it('strips flag (regional indicator) emoji', () => {
    expect(normalizeAlias('🇺🇸 Flag')).toBe('Flag');
  });

  it('leaves emoji-free names untouched', () => {
    expect(normalizeAlias('THORSwap UI')).toBe('THORSwap UI');
    expect(normalizeAlias('swap.chainflip.io')).toBe('swap.chainflip.io');
  });

  it('returns an empty string for emoji-only input', () => {
    expect(normalizeAlias('🧙')).toBe('');
  });
});

describe('formatAggregator', () => {
  it('strips emoji from the aggregator name', () => {
    expect(formatAggregator('HoudiniSwap 🧙‍♂️')).toBe('HoudiniSwap');
  });

  it('applies display overrides after normalizing', () => {
    expect(formatAggregator('THORSwap UI')).toBe('THORSwap');
  });

  it('returns undefined for missing or emoji-only aliases', () => {
    expect(formatAggregator(undefined)).toBeUndefined();
    expect(formatAggregator('🧙')).toBeUndefined();
  });
});
