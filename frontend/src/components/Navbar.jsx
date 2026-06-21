import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingCart, User, LogOut, Settings, Library,
  Gamepad2, Menu, X, Search, ChevronDown, Shield,
  LayoutGrid, Newspaper,
} from 'lucide-react';

import logo from '../assets/MythicLogo.png';
import { useGameLibrary } from '../contexts/GameLibraryContext.jsx';
import { clearStoredUser, getStoredUser } from '../utils/auth';
import { useUiStore } from '../stores/uiStore';

/* ── Badge chip ─────────────────────────────────────────── */
const Badge = ({ count }) =>
  count > 0 ? (
    <motion.span
      key={count}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold leading-none"
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  ) : null;

/* ── Nav link ───────────────────────────────────────────── */
const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'text-white bg-primary/15 border border-primary/30'
          : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
      }`
    }
  >
    {Icon && <Icon size={15} />}
    {label}
  </NavLink>
);

const Navbar = () => {
  const { cartCount, wishlistCount } = useGameLibrary();
  const { mobileNavOpen, toggleMobileNav, closeMobileNav } = useUiStore();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getStoredUser());
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  /* Sync auth state */
  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    window.addEventListener('storage', sync);
    window.addEventListener('auth-changed', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('auth-changed', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  /* Scroll detection for glass effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => {
    clearStoredUser();
    setProfileOpen(false);
    closeMobileNav();
    navigate('/discover');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0F172A]/95 backdrop-blur-xl border-b border-white/8 shadow-[0_4px_32px_rgba(0,0,0,0.5)]'
            : 'bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5'
        }`}
        style={{ height: 'var(--navbar-height)' }}
      >
        <div className="max-w-350 mx-auto h-full px-4 md:px-6 flex items-center gap-4">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src={logo}
              alt="Mythic Games"
              className="h-8 w-8 transition-transform duration-200 group-hover:scale-110"
            />
            <span className="hidden sm:block font-bold text-base tracking-tight text-white">
              Mythic<span className="text-primary-light">Games</span>
            </span>
          </Link>

          {/* ── Desktop nav links ─────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <NavItem to="/discover" icon={Gamepad2} label="Discover" />
            <NavItem to="/browse"   icon={LayoutGrid} label="Browse" />
            <NavItem to="/news"     icon={Newspaper}  label="News" />
          </nav>

          {/* ── Search ───────────────────────────────────────── */}
          <div ref={searchRef} className="flex-1 max-w-sm hidden md:block relative ml-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl bg-surface/60 border border-white/8 text-subtle text-sm hover:bg-surface hover:border-primary/30 transition-all duration-200"
            >
              <Search size={15} />
              <span>Search games…</span>
              <kbd className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 hidden lg:inline">
                /
              </kbd>
            </button>

            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl p-3 shadow-2xl"
                >
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                      <input
                        autoFocus
                        type="search"
                        placeholder="Search games, genres…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#64748B] border border-white/8 focus:outline-none focus:border-primary/40"
                      />
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Spacer ────────────────────────────────────────── */}
          <div className="flex-1 md:hidden" />

          {/* ── Right actions ────────────────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative hidden sm:flex items-center justify-center w-10 h-10 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Wishlist"
            >
              <Heart size={18} />
              <Badge count={wishlistCount} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              <Badge count={cartCount} />
            </Link>

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  profileOpen
                    ? 'bg-primary/15 text-white border border-primary/30'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
                aria-expanded={profileOpen}
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  {user ? (
                    <span className="text-[11px] font-bold text-primary-light uppercase">
                      {(user.username ?? user.email ?? 'U')[0]}
                    </span>
                  ) : (
                    <User size={13} className="text-primary-light" />
                  )}
                </div>
                <span className="hidden lg:block">
                  {user ? (user.username ?? 'Account') : 'Sign in'}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl py-2 shadow-2xl"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-white/8 mb-1">
                          <p className="text-xs text-subtle">Signed in as</p>
                          <p className="text-sm font-semibold text-white truncate">
                            {user.username ?? user.email}
                          </p>
                        </div>

                        {isAdmin ? (
                          <>
                            <MenuItem to="/manage-games" icon={Shield} label="Manage Games" onClick={() => setProfileOpen(false)} />
                            <MenuItem to="/manage-news"  icon={Newspaper} label="Manage News"  onClick={() => setProfileOpen(false)} />
                          </>
                        ) : (
                          <>
                            <MenuItem to="/account"  icon={Settings} label="My Account"  onClick={() => setProfileOpen(false)} />
                            <MenuItem to="/library"  icon={Library}  label="My Library"  onClick={() => setProfileOpen(false)} />
                            <MenuItem to="/orders"   icon={Gamepad2} label="My Orders"   onClick={() => setProfileOpen(false)} />
                            <MenuItem to="/wishlist" icon={Heart}    label="Wishlist"    onClick={() => setProfileOpen(false)} />
                          </>
                        )}

                        <div className="border-t border-white/8 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors duration-150 rounded-lg mx-1"
                            style={{ width: 'calc(100% - 8px)' }}
                          >
                            <LogOut size={15} />
                            Sign out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <MenuItem to="/login"  icon={User}   label="Sign in"  onClick={() => setProfileOpen(false)} />
                        <MenuItem to="/signup" icon={Gamepad2} label="Create account" onClick={() => setProfileOpen(false)} />
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={toggleMobileNav}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
              aria-label="Open navigation menu"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeMobileNav}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 z-40 w-72 glass border-l border-white/8 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/8">
                <div className="flex items-center gap-2.5">
                  <img src={logo} alt="" className="h-8 w-8" />
                  <span className="font-bold text-white">MythicGames</span>
                </div>
                <button onClick={closeMobileNav} className="text-subtle hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
                {/* Search */}
                <form onSubmit={handleSearch} className="mb-3">
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                    <input
                      type="search"
                      placeholder="Search games…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-surface rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#64748B] border border-white/8 focus:outline-none focus:border-primary/40"
                    />
                  </div>
                </form>

                <MobileNavItem to="/discover" icon={Gamepad2} label="Discover"  onClick={closeMobileNav} />
                <MobileNavItem to="/browse"   icon={LayoutGrid} label="Browse"  onClick={closeMobileNav} />
                <MobileNavItem to="/news"     icon={Newspaper}  label="News"    onClick={closeMobileNav} />
                <MobileNavItem to="/cart"     icon={ShoppingCart} label="Cart"  count={cartCount} onClick={closeMobileNav} />
                <MobileNavItem to="/wishlist" icon={Heart}      label="Wishlist" count={wishlistCount} onClick={closeMobileNav} />

                {user ? (
                  <>
                    <div className="border-t border-white/8 my-3" />
                    {isAdmin ? (
                      <>
                        <MobileNavItem to="/manage-games" icon={Shield}    label="Manage Games" onClick={closeMobileNav} />
                        <MobileNavItem to="/manage-news"  icon={Newspaper} label="Manage News"  onClick={closeMobileNav} />
                      </>
                    ) : (
                      <>
                        <MobileNavItem to="/account" icon={Settings} label="My Account" onClick={closeMobileNav} />
                        <MobileNavItem to="/library" icon={Library}  label="My Library" onClick={closeMobileNav} />
                        <MobileNavItem to="/orders"  icon={Gamepad2} label="My Orders"  onClick={closeMobileNav} />
                      </>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors w-full"
                    >
                      <LogOut size={17} />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="border-t border-white/8 my-3" />
                    <MobileNavItem to="/login"  icon={User}     label="Sign in"       onClick={closeMobileNav} />
                    <MobileNavItem to="/signup" icon={Gamepad2} label="Create account" onClick={closeMobileNav} />
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ── Helper sub-components ───────────────────────────────── */
const MenuItem = ({ to, icon: Icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors duration-150 rounded-lg mx-1"
    style={{ width: 'calc(100% - 8px)' }}
  >
    <Icon size={15} className="text-subtle" />
    {label}
  </Link>
);

const MobileNavItem = ({ to, icon: Icon, label, count, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'text-white bg-primary/15 border border-primary/30'
          : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
      }`
    }
  >
    <Icon size={17} />
    {label}
    {count > 0 && (
      <span className="ml-auto min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
        {count}
      </span>
    )}
  </NavLink>
);

export default Navbar;
