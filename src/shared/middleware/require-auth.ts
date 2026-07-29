import { NextResponse } from 'next/server';

import { auth } from '@/shared/lib/auth';

export type AuthContext = {
  userId: string;
  email: string;
  role: 'user' | 'admin';
};

type SessionUser = {
  id?: string;
  email?: string | null;
  role?: 'admin' | 'user';
};

export async function requireAuth(): Promise<{ data: AuthContext } | NextResponse> {
  const session = await auth();
  const sessionUser = session?.user as SessionUser | undefined;

  if (!session || !sessionUser?.id || !sessionUser.email) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  return {
    data: {
      userId: sessionUser.id,
      email: sessionUser.email,
      role: sessionUser.role ?? 'user',
    },
  };
}

export async function requireAdmin(): Promise<{ data: AuthContext } | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (result.data.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  return result;
}
