'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } else {
      setError(result.error || 'Invalid credentials');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <Input
        icon={<Mail size={18} />}
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        icon={<Lock size={18} />}
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isLoading}
      >
        Sign In
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">1G</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              1-CUISINESG
            </h1>
            <p className="text-gray-500">Sign in to access the culinary platform</p>
          </div>
        </CardHeader>

        <CardContent>
          <Suspense fallback={<div className="py-8 text-center text-gray-400">Loading...</div>}>
            <LoginForm />
          </Suspense>

          <p className="mt-6 text-center text-xs text-gray-400">
            Access is restricted. Contact the administrator for credentials.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
