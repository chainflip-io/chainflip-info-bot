import { beforeEach, describe, expect, it } from 'vitest';
import { Pulse } from '../pulse.js';

describe(Pulse, () => {
  let pulse: Pulse;

  beforeEach(() => {
    pulse = new Pulse();
  });

  describe(Pulse.prototype.beat, () => {
    it('sets the last beat', () => {
      /* eslint-disable dot-notation */
      expect(pulse['last']).toBeNull();
      pulse.beat();
      expect(pulse['last']).toBeTypeOf('number');
      /* eslint-enable dot-notation */
    });
  });

  describe(Pulse.prototype.check, () => {
    it('returns returns healthy three times and then dead if no pulse has been set', () => {
      expect(pulse.check()).toBe('healthy');
      expect(pulse.check()).toBe('healthy');
      expect(pulse.check()).toBe('healthy');
      expect(pulse.check()).toBe('dead');
    });

    it('returns healthy when the last call was less than 30 seconds ago', () => {
      // eslint-disable-next-line dot-notation
      pulse['last'] = performance.now() - 25_000;
      expect(pulse.check()).toBe('healthy');
    });

    it('returns dying when the last call was less than 60 seconds ago', () => {
      // eslint-disable-next-line dot-notation
      pulse['last'] = performance.now() - 55_000;
      expect(pulse.check()).toBe('dying');
    });

    it('returns dead when the last call was more than 60 seconds ago', () => {
      // eslint-disable-next-line dot-notation
      pulse['last'] = performance.now() - 65_000;
      expect(pulse.check()).toBe('dead');
    });
  });
});
