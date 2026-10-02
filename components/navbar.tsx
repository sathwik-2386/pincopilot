'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Clock, Settings, Menu, X, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSavedPins } from '@/lib/storage';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pinCount, setPinCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      const pins = getSavedPins();
      setPinCount(pins.length);
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    // Custom event to update pin count when a pin is saved/deleted in-app
    window.addEventListener('pinpilot_pins_updated', updateCount);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('pinpilot_pins_updated', updateCount);
    };
  }, []);

  const navLinks = [
    {
      name: 'Generate',
      href: '/',
      icon: Sparkles,
      active: pathname === '/',
    },
    {
      name: 'History',
      href: '/history',
      icon: Clock,
      active: pathname === '/history',
      badge: pinCount > 0 ? pinCount : undefined,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname === '/settings',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-transform hover:opacity-95"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-red-500 flex items-center justify-center text-white shadow-sm shadow-red-500/20 ring-1 ring-red-600/20">
              <Pin className="h-5 w-5 fill-white text-white rotate-45 transform" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Pin<span className="text-red-600">Pilot</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full border border-red-100">
                  Beta
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 hidden sm:block">
                Turn Product Links Into Pinterest Pins
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    link.active
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      link.active ? 'text-red-600' : 'text-slate-400'
                    )}
                  />
                  <span>{link.name}</span>
                  {link.badge !== undefined && (
                    <span className="ml-1 text-[11px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Status */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>New Pin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-base font-medium',
                  link.active
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      link.active ? 'text-red-600' : 'text-slate-400'
                    )}
                  />
                  <span>{link.name}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
