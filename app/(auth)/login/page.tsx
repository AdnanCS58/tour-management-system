'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiCompass,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
} from 'react-icons/fi';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Logged in successfully!');
        router.push(redirect);
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        {/* Back to Dashboard */}
        <div className="mb-4">
          <Link
            href="../../"
            className="inline-flex items-center text-[#a0b0a8] hover:text-emerald-400 transition text-sm font-medium"
          >
            <FiArrowLeft className="mr-2 w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-[#121816]/90 backdrop-blur-xl border border-[#2a322e] rounded-3xl shadow-2xl p-8 sm:p-10 lg:p-12">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-5 shadow-lg shadow-emerald-500/20">
              <FiCompass className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#e8f0eb]">
              Welcome Back
            </h1>

            <p className="text-[#a0b0a8] mt-3 text-base">
              Login to continue your journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Email
              </label>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7a72] w-5 h-5" />

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-[#1a211e] border border-[#2a322e] rounded-xl text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Password
              </label>

              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7a72] w-5 h-5" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-[#1a211e] border border-[#2a322e] rounded-xl text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7a72] hover:text-[#e8f0eb] transition"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiLogIn className="mr-2 w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Signup */}
          <p className="text-center mt-8 text-[#a0b0a8]">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#0a0f0d]">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}