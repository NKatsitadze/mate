import { describe, it, expect } from 'vitest';

import { escapeRegex } from './escape-regex';

describe('escapeRegex', () => {
  it('leaves a plain word unchanged', () => {
    expect(escapeRegex('burger')).toBe('burger');
  });

  it('escapes every regex metacharacter', () => {
    expect(escapeRegex('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
  });

  it('escapes metacharacters embedded in a larger string', () => {
    expect(escapeRegex('sofa (grey)')).toBe('sofa \\(grey\\)');
  });

  it('returns an empty string unchanged', () => {
    expect(escapeRegex('')).toBe('');
  });

  it('produces a pattern that matches literally, not as regex syntax', () => {
    const pattern = new RegExp(escapeRegex('a.b'), 'i');
    expect(pattern.test('a.b')).toBe(true);
    expect(pattern.test('axb')).toBe(false);
  });
});
