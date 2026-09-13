'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import {
  Home, Search, Building2, Heart, BarChart3,
  Menu, X, LogOut, Key, ChevronDown, MapPin, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { savedAPI } from '@/lib/api';

const navLinks = [
  { href: '/listings', label: 'Buy', icon: Search },
  { href: '/rentals', label: 'Rent', icon: Key },
  { href: '/projects', label: 'Projects', icon: Building2 },
  { href: '/saved', label: 'Saved', icon: Heart },
  { href: '/analytics', label: 'Market Insights', icon: BarChart3 },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      savedAPI.getAll().then(res => {
        setSavedCount(res.count || res.results?.length || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated, pathname]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <>
      <nav
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-200 h-[76px] flex items-center shrink-0',
          'bg-[#050814] border-b border-white/10 shadow-xl shadow-black/80'
        )}
      >
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-black" strokeWidth={2.5} />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg sm:text-xl font-black tracking-tight leading-none">
                  <span className="gold-text">Ivy</span>
                  <span className="text-white"> Homes</span>
                </span>
                <span className="text-[10px] block text-slate-400 font-medium tracking-wide uppercase">
                  Hyderabad Luxury
                </span>
              </div>
            </Link>

            {/* City Tag */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Hyderabad</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'relative flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200',
                      active
                        ? 'text-black bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-500/20 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/8'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                    {href === '/saved' && savedCount !== null && savedCount > 0 && (
                      <span className={cn(
                        'ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-tight',
                        active ? 'bg-black text-amber-400' : 'bg-rose-500 text-white'
                      )}>
                        {savedCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right section: User Profile / Auth */}
            <div className="flex items-center gap-3 shrink-0">
              {!mounted ? (
                <div className="w-[88px] h-[36px] sm:w-[120px] sm:h-[40px] animate-pulse bg-white/5 rounded-xl border border-white/10" />
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    id="user-menu-button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs text-slate-200 font-medium hidden sm:block max-w-[120px] truncate">
                      {user?.email}
                    </span>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200', userMenuOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 z-20 glass-strong rounded-2xl border border-white/15 shadow-2xl shadow-black/80 overflow-hidden"
                        >
                          <div className="p-3.5 border-b border-white/10 bg-white/2">
                            <p className="text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-0.5">Signed In User</p>
                            <p className="text-xs text-white font-medium truncate">{user?.email}</p>
                          </div>
                          <div className="p-1.5 space-y-1">
                            <Link
                              href="/saved"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <Heart className="w-3.5 h-3.5 text-rose-400" /> My Saved Homes
                            </Link>
                            <Link
                              href="/analytics"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <BarChart3 className="w-3.5 h-3.5 text-amber-400" /> Market Analytics
                            </Link>
                            <button
                              id="logout-button"
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
                            >
                              <LogOut className="w-3.5 h-3.5" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-xs font-bold text-black hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                id="mobile-menu-button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[74px] left-0 right-0 z-40 bg-[#050814]/98 backdrop-blur-2xl border-b border-white/10 shadow-2xl md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                      active
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {label}
                    </div>
                    {href === '/saved' && savedCount !== null && savedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500 text-white font-bold">
                        {savedCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              {!isAuthenticated && (
                <div className="pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-sm"
                  >
                    <Sparkles className="w-4 h-4" /> Sign In with Demo Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
