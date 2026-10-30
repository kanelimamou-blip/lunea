import nacl from 'tweetnacl';
import { describe, expect, it } from 'vitest';
import { DEFAULT_DATA } from '../domain/types';
import { migrate, open, seal } from './crypto';

describe('vault crypto', () => {
  const key = nacl.randomBytes(32);
  const data = { ...DEFAULT_DATA, days: { '2026-01-01': { flow: 'heavy' as const, notes: 'Très fatiguée' } } };

  it('round-trips and never stores plaintext', () => {
    const sealed = seal(data, key);
    expect(sealed).not.toContain('fatiguée');
    expect(open(sealed, key)).toEqual(data);
  });

  it('rejects a wrong key', () => {
    expect(() => open(seal(data, key), nacl.randomBytes(32))).toThrow();
  });

  it('fills in missing settings when migrating', () => {
    expect(migrate({ days: {} }).settings.reminders.time).toBe('09:00');
  });
});
