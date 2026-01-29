'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { Eye, EyeOff, Loader2, Play } from 'lucide-react';
import JamboLogo from '@/components/JamboLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // Demo mode - bypass login for product demos
  const handleDemoMode = () => {
    setDemoLoading(true);
    // Set demo auth data in localStorage
    localStorage.setItem('authToken', 'demo-token-for-presentation');
    localStorage.setItem('operator', JSON.stringify({
      id: 'demo-operator',
      companyName: 'Nile Star Coaches',
      email: 'demo@nilestarcoaches.com',
      fullName: 'Demo User',
      role: 'admin',
    }));
    localStorage.setItem('demoMode', 'true');
    // Redirect to dashboard
    router.push('/dashboard');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation - only check if fields are filled
    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 md:px-16 lg:px-24 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <JamboLogo className="w-12 h-12" />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-sm text-gray-500">
              Enter to get unlimited access to data & information.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your mail address"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 accent-purple-600"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-purple-600 hover:underline"
              >
                Forgot your password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">or</span>
              </div>
            </div>

            {/* Demo Mode Button */}
            <button
              type="button"
              onClick={handleDemoMode}
              disabled={demoLoading || loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {demoLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entering Demo...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Enter Demo Mode
                </>
              )}
            </button>

            {/* Bottom Text */}
            <p className="text-center text-xs text-gray-400 mt-6">
              Use Demo Mode to explore the dashboard without credentials
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Waterfall Image */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <img
          src="/beautiful-waterfall-streaming-into-river-surrounded-by-greens.svg"
          alt="Beautiful Waterfall"
          className="w-full h-full object-cover"
        />

        {/* Purple gradient overlay to maintain branding */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-purple-700/30 to-purple-900/50" />

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 -mt-32">
          <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">JAMBO</h2>
          <p className="text-2xl drop-shadow-md">Your Journey, Our Priority</p>
        </div>
      </div>
    </div>
  );
}
