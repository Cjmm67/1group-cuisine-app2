'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Users, ChefHat, BookOpen, Shield } from 'lucide-react';

export default function AdminPage() {
  const { user, isMasterAdmin } = useAuth();

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Admin Panel</h1>
        <p className="text-gray-500">
          Signed in as <span className="font-medium text-gray-700">{user?.name}</span>
          {' '}({user?.role === 'master_admin' ? 'Master Admin' : 'Admin'})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recipe Management */}
        <Link href="/admin/recipes">
          <Card variant="interactive" className="h-full card-hover">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gold-50 flex items-center justify-center">
                <BookOpen size={28} className="text-gold-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Manage Recipes</h3>
                <p className="text-sm text-gray-500">Add or edit recipes for your chef profile</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Chef Profiles */}
        <Link href="/chefs">
          <Card variant="interactive" className="h-full card-hover">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gold-50 flex items-center justify-center">
                <ChefHat size={28} className="text-gold-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Chef Profiles</h3>
                <p className="text-sm text-gray-500">View and manage chef profiles</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* User Management — Master Admin Only */}
        {isMasterAdmin && (
          <Link href="/admin/users">
            <Card variant="interactive" className="h-full card-hover">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Shield size={28} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">User Management</h3>
                  <p className="text-sm text-gray-500">Add or remove admin users</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
