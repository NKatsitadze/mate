'use client';
import { CreditCard, LayoutDashboard, ListChecks, Mail, Package, Store, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { type SidebarNavItem } from '@/shared/const/navigation.const';
import { cn } from '@/shared/lib/utils';

const SIDEBAR_ICON_MAP: Record<SidebarNavItem['icon'], LucideIcon> = {
  overview: LayoutDashboard,
  listings: Package,
  billing: CreditCard,
  shops: Store,
  'admin-listings': ListChecks,
  allowlist: Mail,
};

type SidebarProps = {
  items: SidebarNavItem[];
  className?: string;
  onNavigate?: () => void;
};

export const Sidebar = ({ items, className, onNavigate }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex w-64 shrink-0 flex-col gap-1 border-r border-border bg-sidebar p-3',
        className
      )}
    >
      <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Workspace
      </p>
      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, icon }) => {
          const Icon = SIDEBAR_ICON_MAP[icon];
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
