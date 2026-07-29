import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { DashboardShell } from '@/shared/components/layout/dashboard-shell';
import { ADMIN_SIDEBAR_NAV_ITEMS } from '@/shared/const/navigation.const';
import { auth } from '@/shared/lib/auth';

type SessionUser = {
  role?: 'admin' | 'user';
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const sessionUser = session?.user as SessionUser | undefined;

  if (sessionUser?.role !== 'admin') redirect('/dashboard');

  return <DashboardShell navItems={ADMIN_SIDEBAR_NAV_ITEMS}>{children}</DashboardShell>;
}
