'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';

type Tab = 'login' | 'signup';

interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface FieldError {
  field: string;
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  function getFieldError(field: string): string | undefined {
    return fieldErrors.find((e) => e.field === field)?.message;
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setIsLoading(true);

    try {
      const data = await apiPost<LoginResponse>('/api/auth/login', {
        username,
        password,
      });

      login(data.accessToken, {
        userId: username,
        name: username === 'demo' ? 'Demo User' : username,
        phone: username,
      });

      router.push('/');
    } catch (err: unknown) {
      const apiErr = err as Error & { details?: FieldError[]; code?: string };
      if (apiErr.code === 'VALIDATION_ERROR' && apiErr.details) {
        setFieldErrors(apiErr.details);
      } else {
        setError(apiErr.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setIsLoading(true);

    try {
      await apiPost('/api/auth/signup', {
        name: signupName,
        phone: signupPhone,
        password: signupPassword,
      });

      setSignupSuccess(true);
      setTimeout(() => {
        setActiveTab('login');
        setUsername(signupPhone);
        setSignupSuccess(false);
      }, 1500);
    } catch (err: unknown) {
      const apiErr = err as Error & { details?: FieldError[]; code?: string };
      if (apiErr.code === 'VALIDATION_ERROR' && apiErr.details) {
        setFieldErrors(apiErr.details);
      } else {
        setError(apiErr.message || 'Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError('');
    setFieldErrors([]);
    setIsLoading(true);

    try {
      const data = await apiPost<LoginResponse>('/api/auth/login', {
        username: 'demo',
        password: 'demo1234',
      });

      login(data.accessToken, {
        userId: 'demo',
        name: 'Demo User',
        email: 'demo@urgentcart.com',
        phone: '+919876543210',
      });

      router.push('/');
    } catch (err: unknown) {
      const apiErr = err as Error;
      setError(apiErr.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-3xl">🛒</span>
          <h1 className="text-xl font-bold text-gray-900 mt-1">UrgentCart</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {/* Tab toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              onClick={() => { setActiveTab('login'); setError(''); setFieldErrors([]); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); setFieldErrors([]); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          {/* Signup success */}
          {signupSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2 mb-4">
              Account created! Switching to login...
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone or Email
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter phone or email"
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange/50 focus:border-amazon-orange"
                  required
                  disabled={isLoading}
                />
                {getFieldError('username') && (
                  <p className="text-xs text-red-600 mt-1">{getFieldError('username')}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange/50 focus:border-amazon-orange"
                  required
                  disabled={isLoading}
                />
                {getFieldError('password') && (
                  <p className="text-xs text-red-600 mt-1">{getFieldError('password')}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-amazon-orange hover:bg-amazon-orange/90 text-white font-semibold rounded-xl"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange/50 focus:border-amazon-orange"
                  required
                  disabled={isLoading}
                />
                {getFieldError('name') && (
                  <p className="text-xs text-red-600 mt-1">{getFieldError('name')}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="signup-phone"
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange/50 focus:border-amazon-orange"
                  required
                  disabled={isLoading}
                />
                {getFieldError('phone') && (
                  <p className="text-xs text-red-600 mt-1">{getFieldError('phone')}</p>
                )}
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange/50 focus:border-amazon-orange"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                {getFieldError('password') && (
                  <p className="text-xs text-red-600 mt-1">{getFieldError('password')}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-amazon-orange hover:bg-amazon-orange/90 text-white font-semibold rounded-xl"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-xs text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Demo Login */}
          <Button
            onClick={handleDemoLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full h-11 rounded-xl font-medium border-amazon-orange text-amazon-orange hover:bg-amazon-orange/5"
          >
            🚀 Demo Login (Quick Access)
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By continuing, you agree to UrgentCart&apos;s Terms of Service
        </p>
      </div>
    </div>
  );
}
