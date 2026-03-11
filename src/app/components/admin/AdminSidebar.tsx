'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Target,
  TrendingUp,
  Activity,
  Users,
  BarChart3,
  Key,
  Settings,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/app/components/ui/sheet';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin', exact: true },
  { label: 'Research', icon: FileText, href: '/admin/research' },
  { label: 'Theses', icon: Target, href: '/admin/thesis' },
  { label: 'Regime', icon: TrendingUp, href: '/admin/regime' },
  { label: 'Cycles', icon: Activity, href: '/admin/cycle' },
  { label: 'Members', icon: Users, href: '/admin/settings/members' },
  { label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { label: 'API Keys', icon: Key, href: '/admin/api-keys' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

function NavItem({
  item,
  pathname,
  onClick,
}: {
  item: (typeof navItems)[number];
  pathname: string;
  onClick?: () => void;
}) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <item.icon className="w-5 h-5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarNav({ pathname, onNavClick }: { pathname: string; onNavClick?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo / Title */}
      <div className="px-4 py-5 border-b border-gray-200">
        <span className="text-lg font-bold text-gray-900">IC Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            pathname={pathname}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Back to site */}
      <div className="px-3 py-4 border-t border-gray-200">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          <span>Back to site</span>
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
        <SidebarNav pathname={pathname} />
      </aside>

      {/* Mobile hamburger + Sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarNav pathname={pathname} onNavClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
