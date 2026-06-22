import { Menu, Bell, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getStoredUser } from '../../utils/auth';

const CRUMB_MAP = {
  '/admin':            'Dashboard',
  '/admin/games':      'Games',
  '/admin/categories': 'Categories',
  '/admin/orders':     'Orders',
  '/admin/payments':   'Payments',
  '/admin/users':      'Users',
  '/admin/invoices':   'Invoices',
  '/admin/receipts':   'Receipts',
  '/admin/analytics':  'Analytics',
};

export default function AdminNavbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const user         = getStoredUser();
  const crumb        = CRUMB_MAP[pathname] ?? 'Admin';

  return (
    <header className="h-14 shrink-0 bg-bg-deep border-b border-white/8 flex items-center px-4 gap-3">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2 text-sm text-subtle">
        <Link to="/" className="hover:text-foreground transition-colors">
          <Home size={14} />
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{crumb}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative p-1.5 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors">
          <Bell size={17} />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-white/8">
          <div className="w-7 h-7 rounded-full bg-primary/25 border border-primary/30 flex items-center justify-center">
            <span className="text-primary-light text-xs font-bold">
              {user?.username?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-foreground text-xs font-semibold leading-tight">{user?.username ?? 'Admin'}</p>
            <p className="text-subtle text-[10px] capitalize">{user?.role ?? 'admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
