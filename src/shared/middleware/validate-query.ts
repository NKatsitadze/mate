import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export async function validateQuery<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T } | NextResponse> {
  const query = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = schema.safeParse(query);
  if (!result.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: result.error.flatten() },
      { status: 400 }
    );
  }
  return { data: result.data };
}
