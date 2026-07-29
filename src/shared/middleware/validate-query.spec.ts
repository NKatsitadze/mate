import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { validateQuery } from './validate-query';

const Schema = z.object({
  category: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
});

function makeRequest(query: string) {
  return new NextRequest(`http://localhost/api/test?${query}`);
}

describe('validateQuery', () => {
  it('returns parsed data for a valid query string', async () => {
    const result = await validateQuery(makeRequest('category=bakery&page=2'), Schema);
    expect(result).toEqual({ data: { category: 'bakery', page: 2 } });
  });

  it('coerces numeric query params', async () => {
    const result = await validateQuery(makeRequest('page=3'), Schema);
    expect(result).toEqual({ data: { page: 3 } });
  });

  it('returns 400 for an invalid query string', async () => {
    const result = await validateQuery(makeRequest('page=not-a-number'), Schema);
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });

  it('returns parsed empty data when no query params are given and all are optional', async () => {
    const result = await validateQuery(makeRequest(''), Schema);
    expect(result).toEqual({ data: {} });
  });
});
