import { describe, it, expect, vi, afterEach } from 'vitest';

import { HOUR_MS, startOfTodayInGeorgia } from './time';

describe('startOfTodayInGeorgia', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns midnight Tbilisi time for a time later in the same Tbilisi day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T10:00:00Z'));

    const result = startOfTodayInGeorgia();

    expect(result.toISOString()).toBe('2024-06-14T20:00:00.000Z');
  });

  it('rolls over to the next Tbilisi day once past the UTC+4 midnight boundary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-14T21:00:00Z'));

    const result = startOfTodayInGeorgia();

    expect(result.toISOString()).toBe('2024-06-14T20:00:00.000Z');
  });
});

describe('HOUR_MS', () => {
  it('is one hour in milliseconds', () => {
    expect(HOUR_MS).toBe(60 * 60 * 1000);
  });
});
