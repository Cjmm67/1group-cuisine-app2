'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="hidden sm:inline-flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-charcoal-700" />
          </button>

          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-playfair font-bold text-sm">1G</span>
            </div>
            <span className="hidden sm:inline font-playfair text-lg font-semibold text-charcoal-800">
              1-Group Cuisine
            </span>
          </Link>
        </div>

        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search recipes, chefs..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Avatar name={user.name} image={user.avatar} size="md" />
          ) : (
            <Link href="/login" className="text-sm font-medium text-gold-500 hover:text-gold-600">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
