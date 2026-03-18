'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChefHat,
  BookOpen,
  Users,
  ShoppingBag,
  Leaf,
  Truck,
  BarChart3,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

const MENU_ITEMS = [
  {
    label: 'Recipes',
    href: '/recipes',
    icon: BookOpen,
  },
  {
    label: 'Chefs',
    href: '/chefs',
    icon: Users,
  },
  {
    label: 'Masterclasses',
    href: '/masterclasses',
    icon: ChefHat,
  },
  {
    label: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
  },
  {
    label: 'Sustainability',
    href: '/sustainability',
    icon: Leaf,
  },
  {
    label: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-40',
          'sm:translate-x-0 transition-transform duration-300',
          !sidebarOpen && '-translate-x-full sm:translate-x-0'
        )}
      >
        <div className="p-4 space-y-2">
          <button
            onClick={() => setSidebarOpen(false)}
            className="sm:hidden absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>

          <nav className="space-y-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-250',
                    isActive
                      ? 'bg-gold-50 text-gold-700 font-medium'
                      : 'text-charcoal-600 hover:bg-gray-50'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
