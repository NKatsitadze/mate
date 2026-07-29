import { describe, it, expect, vi, afterEach } from 'vitest';

import { getDiscountPercent, getExpiryLabel, getListingCategoryLabel } from './listing-display';

describe('getDiscountPercent', () => {
  it('rounds the discount percentage', () => {
    expect(getDiscountPercent(100, 75)).toBe(25);
  });

  it('returns 0 when there is no discount', () => {
    expect(getDiscountPercent(100, 100)).toBe(0);
  });

  it('rounds to the nearest whole percent', () => {
    expect(getDiscountPercent(30, 20)).toBe(33);
  });
});

describe('getListingCategoryLabel', () => {
  it('returns the label for a known category', () => {
    expect(getListingCategoryLabel('electronics')).toBe('Electronics');
  });

  it('returns the label for every configured category', () => {
    expect(getListingCategoryLabel('furniture_home')).toBe('Furniture & Home');
    expect(getListingCategoryLabel('other')).toBe('Other');
  });
});

describe('getExpiryLabel', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Expired" once the expiry time has passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-30T12:00:00Z'));

    expect(getExpiryLabel('2026-07-30T11:00:00Z')).toBe('Expired');
  });

  it('returns "Expires today" when under 24 hours remain', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-30T12:00:00Z'));

    expect(getExpiryLabel('2026-07-31T00:00:00Z')).toBe('Expires today');
  });

  it('returns "Expires tomorrow" when between 24 and 48 hours remain', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-30T12:00:00Z'));

    expect(getExpiryLabel('2026-07-31T18:00:00Z')).toBe('Expires tomorrow');
  });

  it('returns a day count once 2 or more days remain', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-30T12:00:00Z'));

    expect(getExpiryLabel('2026-08-03T12:00:00Z')).toBe('Expires in 4 days');
  });

  it('accepts a Date instance as well as a string', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-30T12:00:00Z'));

    expect(getExpiryLabel(new Date('2026-07-30T18:00:00Z'))).toBe('Expires today');
  });
});
