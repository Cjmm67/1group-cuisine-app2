'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      // Always show success (don't reveal if email exists)
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    }

    setForgotLoading(false);
  };

  // Forgot password view
  if (showForgot) {
    return (
      <div className="space-y-4">
        {forgotSent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Check your email</h3>
            <p className="text-sm text-gray-500">
              If an account exists for <strong>{forgotEmail}</strong>, a password reset link has been sent.
            </p>
            <button
              onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }}
              className="mt-4 text-sm text-gold-600 hover:text-gold-700 font-medium"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-gray-500">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <Input
              icon={<Mail size={18} />}
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={forgotLoading}
            >
              Send Reset Link
            </Button>
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Back to sign in
            </button>
          </form>
        )}
      </div>
    );
  }

  // Login view
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0" />
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

      <div className="relative">
        <Input
          icon={<Lock size={18} />}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isLoading}
      >
        Sign In
      </Button>

      <button
        type="button"
        onClick={() => setShowForgot(true)}
        className="w-full text-sm text-gold-500 hover:text-gold-600 font-medium"
      >
        Forgot password?
      </button>
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
        </CardContent>
      </Card>
    </div>
  );
}
