'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, UserPlus, Copy, Check, AlertCircle } from 'lucide-react';

export default function UsersPage() {
  const { user, isMasterAdmin } = useAuth();
  const [copied, setCopied] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedUsers, setGeneratedUsers] = useState<Array<{ email: string; name: string; password: string }>>([]);

  if (!isMasterAdmin) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={18} />
          <span>Only the Master Admin can manage users.</span>
        </div>
      </div>
    );
  }

  const addUser = () => {
    if (!newEmail || !newPassword) return;
    setGeneratedUsers([
      ...generatedUsers,
      {
        email: newEmail,
        name: newName || newEmail.split('@')[0],
        password: newPassword,
      },
    ]);
    setNewEmail('');
    setNewName('');
    setNewPassword('');
  };

  const removeUser = (index: number) => {
    setGeneratedUsers(generatedUsers.filter((_, i) => i !== index));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let pass = '';
    for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setNewPassword(pass);
  };

  const envVarValue = JSON.stringify(
    generatedUsers.map((u) => ({
      email: u.email,
      name: u.name,
      password: u.password,
    }))
  );

  const copyEnvVar = () => {
    navigator.clipboard.writeText(envVarValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">User Management</h1>
        <p className="text-gray-500">
          Add admin users who can add recipes to chef pages. You are the Master Admin.
        </p>
      </div>

      {/* Current Master Admin */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={18} className="text-purple-600" />
            Master Admin
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <Badge variant="primary">Master Admin</Badge>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Set via MASTER_ADMIN_EMAIL and MASTER_ADMIN_PASSWORD environment variables in Vercel.
          </p>
        </CardContent>
      </Card>

      {/* Add New Admin Users */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus size={18} className="text-gold-600" />
            Admin Users
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-500">
            Create admin credentials below. Once done, copy the generated environment variable
            and paste it into your Vercel project settings as <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">ADMIN_USERS</code>.
          </p>

          {/* Add user form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
            />
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
              />
              <button
                onClick={generatePassword}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-600 transition-colors whitespace-nowrap"
              >
                Generate
              </button>
            </div>
            <button
              onClick={addUser}
              disabled={!newEmail || !newPassword}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add User
            </button>
          </div>

          {/* User list */}
          {generatedUsers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Pending Admin Users</h3>
              {generatedUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">Password: {u.password}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Admin</Badge>
                    <button
                      onClick={() => removeUser(i)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Generated env var */}
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    ADMIN_USERS environment variable
                  </p>
                  <button
                    onClick={copyEnvVar}
                    className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 font-medium"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {envVarValue}
                </pre>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium mb-1">How to apply:</p>
                <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Copy the value above</li>
                  <li>Go to <strong>Vercel → Project Settings → Environment Variables</strong></li>
                  <li>Add or update <code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">ADMIN_USERS</code> with the copied value</li>
                  <li>Redeploy the project for changes to take effect</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
