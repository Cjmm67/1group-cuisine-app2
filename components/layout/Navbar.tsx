'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Recipes', href: '/recipes' },
  { label: 'Chefs', href: '/chefs' },
  { label: '1-Cheflix', href: '/masterclasses' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Sustainability', href: '/sustainability' },
  { label: 'Suppliers', href: '/suppliers' },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-10">
        {/* Left: hamburger + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 -ml-1.5 hover:bg-gray-100 rounded"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-gray-900">1-CUISINESG</span>
          </Link>
        </div>

        {/* Center: search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search recipes, chefs, ingredients..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border-0 rounded-full focus:bg-white focus:ring-2 focus:ring-gold-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: sign in */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-1.5 hover:bg-gray-100 rounded"
          >
            <Search size={20} />
          </button>
          <Link
            href="/login"
            className="hidden sm:inline-block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Nav links bar (desktop) */}
      <nav className="hidden lg:block border-t border-gray-100">
        <div className="flex items-center justify-center gap-0 px-4 sm:px-6 lg:px-10">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-gold-600 text-gold-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-gray-100 pt-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search recipes, chefs..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-6 py-3 text-sm font-medium border-b border-gray-50',
                  isActive ? 'text-gold-700 bg-gold-50' : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
