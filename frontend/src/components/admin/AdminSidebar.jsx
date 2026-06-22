import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Gamepad2, Tag, ShoppingBag, CreditCard,
  Users, FileText, Receipt, BarChart3, X, Shield, LogOut,
} from 'lucide-react';
import { clearStoredUser } from '../../utils/auth';

const NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/admin/games',      icon: Gamepad2,        label: 'Games' },
  { to: '/admin/categories', icon: Tag,             label: 'Categories' },
  { to: '/admin/orders',     icon: ShoppingBag,     label: 'Orders' },
  { to: '/admin/payments',   icon: CreditCard,      label: 'Payments' },
  { to: '/admin/users',      icon: Users,           label: 'Users' },
  { to: '/admin/invoices',   icon: FileText,        label: 'Invoices' },
  { to: '/admin/receipts',   icon: Receipt,         label: 'Receipts' },
  { to: '/admin/analytics',  icon: BarChart3,       label: 'Analytics' },
];

export default function AdminSidebar({ open, onClose }) {
  const navigate  = useNavigate();

  const handleLogout = () => {
    clearStoredUser();
    navigate('/login');
  };

  const sidebar = (
    <div className="flex flex-col h-full w-64 bg-bg-deep border-r border-white/8">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Shield size={16} className="text-primary-light" />
          </div>
          <div>
            <p className="text-foreground text-sm font-bold leading-tight">Mythic Admin</p>
            <p className="text-subtle text-[10px]">Control Panel</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-subtle hover:text-foreground hover:bg-white/8 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary/15 text-primary-light border border-primary/25'
                  : 'text-subtle hover:text-foreground hover:bg-white/5'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-subtle hover:text-danger hover:bg-danger/8 transition-colors"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex shrink-0">{sidebar}</div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
