import { type ReactNode } from 'react';

import { DashboardShell } from '@/shared/components/layout/dashboard-shell';
import { MERCHANT_SIDEBAR_NAV_ITEMS } from '@/shared/const/navigation.const';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell navItems={MERCHANT_SIDEBAR_NAV_ITEMS}>{children}</DashboardShell>;
}
