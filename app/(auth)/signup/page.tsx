'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiLock,
  FiUserPlus,
  FiCompass,
  FiUpload,
  FiPhone,
  FiX,
  FiEye,
  FiEyeOff,
  FiMapPin,
  FiArrowRight,
  FiGlobe,
} from 'react-icons/fi';

export default function SignupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactInfo: '',
  });

  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setUploading(true);

    const reader = new FileReader();

    reader.onload = (event) => {
      const base64String = event.target?.result as string;

      setAvatar(base64String);
      setAvatarPreview(base64String);
      setUploading(false);

      toast.success('Profile picture uploaded!');
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setUploading(false);
      toast.error('Failed to upload image');
    };

    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatar('');
    setAvatarPreview('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          avatar: avatar || '',
          contactInfo: formData.contactInfo,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Account created successfully! Please login.');
        router.push('/login');
      } else {
        toast.error(data.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b09] text-white flex items-center justify-center px-4 py-8 md:px-8">

      <div className="w-full max-w-7xl">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-[0.9fr_1.1fr] bg-[#101613] border border-[#27312c] rounded-3xl overflow-hidden shadow-2xl"
        >

          {/* ===================================================== */}
          {/* LEFT TRAVEL SECTION */}
          {/* ===================================================== */}

          <div className="relative hidden lg:flex min-h-[760px] overflow-hidden">

            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-[#10251d] to-[#07100c]" />

            {/* Decorative circles */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-between w-full p-12">

              <div>
                <div className="flex items-center gap-3 mb-12">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <FiCompass className="w-6 h-6 text-white" />
                  </div>

                  <span className="text-xl font-bold tracking-tight">
                    TravelMate
                  </span>
                </div>

                <div className="max-w-md">
                  <p className="text-emerald-400 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
                    Your journey starts here
                  </p>

                  <h2 className="text-5xl font-bold leading-tight text-white">
                    Explore more.
                    <br />
                    Travel together.
                  </h2>

                  <p className="text-[#9cacA4] text-lg leading-relaxed mt-6">
                    Create your account and start planning unforgettable
                    journeys with your friends and travel companions.
                  </p>
                </div>

                {/* Travel features */}
                <div className="mt-10 space-y-5">

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <FiMapPin className="text-emerald-400 w-5 h-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        Plan your journeys
                      </p>
                      <p className="text-sm text-[#819088]">
                        Organize every trip in one place
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <FiUserPlus className="text-emerald-400 w-5 h-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        Travel with friends
                      </p>
                      <p className="text-sm text-[#819088]">
                        Invite your group and manage your tour together
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <FiGlobe className="text-emerald-400 w-5 h-5" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        Discover new places
                      </p>
                      <p className="text-sm text-[#819088]">
                        Turn your travel ideas into real adventures
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom quote */}
              <div className="border-t border-white/10 pt-6">
                <p className="text-sm text-[#819088] italic">
                  "The best journeys are the ones shared with people you love."
                </p>
              </div>

            </div>
          </div>


          {/* ===================================================== */}
          {/* RIGHT SIGNUP SECTION */}
          {/* ===================================================== */}

          <div className="p-6 sm:p-10 lg:p-12 xl:p-14">

            <div className="max-w-2xl mx-auto">

              {/* Mobile logo */}
              <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <FiCompass className="w-6 h-6 text-white" />
                </div>

                <span className="text-xl font-bold">
                  TravelMate
                </span>
              </div>

              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-5">
                  <FiUserPlus className="w-6 h-6 text-emerald-400" />
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-[#e8f0eb]">
                  Create your account
                </h1>

                <p className="text-[#84948c] mt-2">
                  Join TravelMate and start your next adventure.
                </p>
              </div>


              {/* ================================================= */}
              {/* FORM */}
              {/* ================================================= */}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Profile Picture */}
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-[#151c18] border border-[#27312c]">

                  {avatarPreview ? (
                    <div className="relative flex-shrink-0">
                      <img
                        src={avatarPreview}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500"
                      />

                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 flex-shrink-0 rounded-full bg-[#1b241f] border-2 border-dashed border-[#354039] flex flex-col items-center justify-center text-[#718078] hover:border-emerald-500 hover:text-emerald-400 transition"
                    >
                      <FiUpload className="w-5 h-5 mb-1" />
                      <span className="text-[11px]">
                        Upload
                      </span>
                    </button>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-[#e8f0eb]">
                      Profile picture
                    </p>

                    <p className="text-xs text-[#74827b] mt-1">
                      Optional · JPG, PNG or WEBP · Max 2MB
                    </p>

                    {uploading && (
                      <p className="text-xs text-emerald-400 mt-2">
                        Uploading...
                      </p>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                </div>


                {/* Name + Email */}
                <div className="grid md:grid-cols-2 gap-5">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#dce5df] mb-2">
                      Full Name *
                    </label>

                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#65736c]" />

                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          })
                        }
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-[#151c18] border border-[#2a342f] rounded-xl text-[#e8f0eb] placeholder-[#64716b] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>


                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-[#dce5df] mb-2">
                      Email *
                    </label>

                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#65736c]" />

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
                        className="w-full pl-11 pr-4 py-3.5 bg-[#151c18] border border-[#2a342f] rounded-xl text-[#e8f0eb] placeholder-[#64716b] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                </div>


                {/* Contact */}
                <div>
                  <label className="block text-sm font-medium text-[#dce5df] mb-2">
                    Contact Information
                    <span className="text-[#68766e] font-normal">
                      {' '}· Optional
                    </span>
                  </label>

                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#65736c]" />

                    <input
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactInfo: e.target.value,
                        })
                      }
                      className="w-full pl-11 pr-4 py-3.5 bg-[#151c18] border border-[#2a342f] rounded-xl text-[#e8f0eb] placeholder-[#64716b] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition"
                      placeholder="Phone number, WhatsApp, etc."
                    />
                  </div>
                </div>


                {/* Passwords */}
                <div className="grid md:grid-cols-2 gap-5">

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#dce5df] mb-2">
                      Password *
                    </label>

                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#65736c]" />

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
                        minLength={6}
                        className="w-full pl-11 pr-12 py-3.5 bg-[#151c18] border border-[#2a342f] rounded-xl text-[#e8f0eb] placeholder-[#64716b] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition"
                        placeholder="••••••••"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#65736c] hover:text-[#e8f0eb] transition"
                      >
                        {showPassword ? (
                          <FiEyeOff className="w-5 h-5" />
                        ) : (
                          <FiEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#68766e] mt-1.5">
                      At least 6 characters
                    </p>
                  </div>


                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#dce5df] mb-2">
                      Confirm Password *
                    </label>

                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#65736c]" />

                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        required
                        minLength={6}
                        className={`w-full pl-11 pr-12 py-3.5 bg-[#151c18] border rounded-xl text-[#e8f0eb] placeholder-[#64716b] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition ${
                          formData.confirmPassword &&
                          formData.password !== formData.confirmPassword
                            ? 'border-red-500'
                            : 'border-[#2a342f]'
                        }`}
                        placeholder="••••••••"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#65736c] hover:text-[#e8f0eb] transition"
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className="w-5 h-5" />
                        ) : (
                          <FiEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {formData.confirmPassword &&
                      formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1.5">
                          Passwords do not match
                        </p>
                      )}
                  </div>

                </div>


                {/* Submit */}
                <motion.button
                  whileHover={{ scale: loading || uploading ? 1 : 1.01 }}
                  whileTap={{ scale: loading || uploading ? 1 : 0.98 }}
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-emerald-600/20"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiUserPlus className="mr-2" />
                      Create Account
                      <FiArrowRight className="ml-2" />
                    </>
                  )}
                </motion.button>

              </form>


              {/* Login */}
              <p className="text-center mt-7 text-[#84948c]">
                Already have an account?{' '}

                <Link
                  href="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition"
                >
                  Login
                </Link>
              </p>

            </div>
          </div>

        </motion.div>

        {/* Bottom text */}
        <p className="text-center text-xs text-[#53615a] mt-5">
          Plan your journey. Share the experience. Make memories.
        </p>

      </div>
    </div>
  );
}