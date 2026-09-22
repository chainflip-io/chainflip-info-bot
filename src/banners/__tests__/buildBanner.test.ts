import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  backgroundFileFor,
  TIER_1_THRESHOLD,
  TIER_2_THRESHOLD,
  TIER_3_THRESHOLD,
  tierFor,
} from '../buildBanner.js';

const backgroundsDir = join(dirname(fileURLToPath(import.meta.url)), '../../assets/backgrounds');

describe('tierFor', () => {
  it('maps USD value to the right tier at each threshold boundary', () => {
    expect(tierFor(0)).toBe(1);
    expect(tierFor(TIER_1_THRESHOLD - 1)).toBe(1);
    expect(tierFor(TIER_1_THRESHOLD)).toBe(2);
    expect(tierFor(TIER_2_THRESHOLD)).toBe(3);
    expect(tierFor(TIER_3_THRESHOLD)).toBe(4);
  });
});

describe('backgroundFileFor', () => {
  it('picks the swap-class background per tier and variant', () => {
    expect(backgroundFileFor(1, false)).toBe('Regular swap_Regular');
    expect(backgroundFileFor(1, true)).toBe('Regular swap_Boosted');
    expect(backgroundFileFor(2, false)).toBe('Large swap_Regular');
    expect(backgroundFileFor(2, true)).toBe('Large swap_Boosted');
    expect(backgroundFileFor(3, false)).toBe('Mega swap_Regular');
    expect(backgroundFileFor(3, true)).toBe('Mega swap_Boosted');
  });

  it('uses the shared gold Giga background for tier 4 and for records', () => {
    expect(backgroundFileFor(4, false)).toBe('Giga swap_Regular & Boosted');
    expect(backgroundFileFor(4, true)).toBe('Giga swap_Regular & Boosted');
    // Records (any tier) share the same gold background.
    expect(backgroundFileFor(2, false, true)).toBe('Giga swap_Regular & Boosted');
    expect(backgroundFileFor(4, false, true)).toBe('Giga swap_Regular & Boosted');
  });

  it('resolves to a background file that exists on disk for every case', () => {
    const cases: [number, boolean, boolean][] = [
      [1, false, false],
      [1, true, false],
      [2, false, false],
      [2, true, false],
      [3, false, false],
      [3, true, false],
      [4, false, false],
      [4, true, false],
      [4, false, true],
    ];
    for (const [tier, isBoosted, isRecord] of cases) {
      const file = join(backgroundsDir, `${backgroundFileFor(tier, isBoosted, isRecord)}.png`);
      expect(existsSync(file), `missing background: ${file}`).toBe(true);
    }
  });
});
