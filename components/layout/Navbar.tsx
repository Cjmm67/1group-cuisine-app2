'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Recipes', href: '/recipes' },
  { label: 'Chefs', href: '/chefs' },
  { label: 'Masterclasses', href: '/masterclasses' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Sustainability', href: '/sustainability' },
  { label: 'Suppliers', href: '/suppliers' },
];

export const Navbar = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">1G</span>
            </div>
            <span className="hidden sm:inline text-lg font-semibold text-gray-900 tracking-tight">
              1-Group Cuisine
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'text-gold-700 bg-gold-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side: Search + Logo + Sign In */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-48 lg:w-56 pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-all outline-none"
                />
              </div>
            </div>

            {/* 1-Group Logo */}
            <Image
              src="/1group-logo.png"
              alt="1-Group"
              width={44}
              height={44}
              className="hidden sm:block"
            />

            {/* Sign In */}
            <Link
              href="/login"
              className="text-sm font-medium text-white bg-gold-600 hover:bg-gold-700 px-4 py-2 rounded-lg transition-colors"
            >
              Sign in
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3 space-y-1">
            <div className="md:hidden px-2 pb-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search recipes, chefs..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-gold-400 outline-none"
                />
              </div>
            </div>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'text-gold-700 bg-gold-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
