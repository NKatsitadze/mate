export type SidebarNavItem = {
  href: string;
  label: string;
  icon: 'overview' | 'listings' | 'billing' | 'shops' | 'admin-listings' | 'allowlist';
};

export const MERCHANT_SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: 'overview' },
  { href: '/dashboard/listings', label: 'Listings', icon: 'listings' },
  { href: '/dashboard/billing', label: 'Billing', icon: 'billing' },
];

export const ADMIN_SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { href: '/admin', label: 'Shops', icon: 'shops' },
  { href: '/admin/listings', label: 'Listings', icon: 'admin-listings' },
  { href: '/admin/allowlist', label: 'Allowlist', icon: 'allowlist' },
];
