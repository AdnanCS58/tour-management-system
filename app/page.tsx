'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiMapPin, FiUsers, FiDollarSign, FiCompass, FiArrowRight, FiShield, FiSmartphone, FiMoon } from 'react-icons/fi';

export default function LandingPage() {
  const { data: session } = useSession();

  const features = [
    {
      icon: FiUsers,
      title: 'Private Tour Groups',
      description: 'Create private groups for your trips and invite friends with unique codes.',
      color: 'from-emerald-500 to-teal-500',
      delay: 0.2,
    },
    {
      icon: FiDollarSign,
      title: 'Smart Expense Tracking',
      description: 'Track shared expenses with automatic calculations for equal and unequal splits.',
      color: 'from-blue-500 to-indigo-500',
      delay: 0.4,
    },
    {
      icon: FiMapPin,
      title: 'Live Location Sharing',
      description: 'Optionally share your location with group members during trips.',
      color: 'from-purple-500 to-pink-500',
      delay: 0.6,
    },
    {
      icon: FiShield,
      title: 'Privacy First',
      description: 'Your tour data is private and only visible to group members.',
      color: 'from-orange-500 to-red-500',
      delay: 0.8,
    },
    {
      icon: FiSmartphone,
      title: 'Mobile Friendly',
      description: 'Access your tours from any device with a responsive design.',
      color: 'from-cyan-500 to-blue-500',
      delay: 1.0,
    },
    {
      icon: FiMoon,
      title: 'Dark Nature Theme',
      description: 'Beautiful dark theme inspired by nature for comfortable viewing.',
      color: 'from-teal-500 to-emerald-500',
      delay: 1.2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f0d] leaf-pattern">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <FiCompass className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">TripTribe</span>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-[#a0b0a8] hover:text-[#e8f0eb] transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tours/create"
                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-500 transition"
                >
                  Create Tour
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#a0b0a8] hover:text-[#e8f0eb] transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-500 transition"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-6 px-4 py-2 bg-emerald-600/10 border border-emerald-600/20 rounded-full">
            <span className="text-emerald-400 text-sm">🌿 Nature-Inspired Travel Companion</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-[#e8f0eb]">Travel Together,</span>
            <span className="gradient-text block">Manage Effortlessly</span>
          </h1>
          <p className="text-xl text-[#a0b0a8] mb-12 max-w-3xl mx-auto">
            Create private tour groups, track shared expenses, and locate your travel companions in real-time. Your ultimate travel companion app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!session ? (
              <>
                <Link
                  href="/signup"
                  className="bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-500 transition flex items-center justify-center shadow-lg shadow-emerald-600/20"
                >
                  Start Your Journey
                  <FiArrowRight className="ml-2" />
                </Link>
                <Link
                  href="/login"
                  className="bg-[#1a211e] text-emerald-400 px-8 py-4 rounded-xl text-lg font-semibold border border-emerald-600/30 hover:bg-[#222a26] transition"
                >
                  Login
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-500 transition flex items-center justify-center shadow-lg shadow-emerald-600/20"
              >
                Go to Dashboard
                <FiArrowRight className="ml-2" />
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#e8f0eb] mb-4">Why TripTribe?</h2>
          <p className="text-[#a0b0a8] max-w-2xl mx-auto">
            Everything you need to manage group travel in one place
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay }}
              className="glass-card glass-card-hover p-8 cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#e8f0eb] mb-4">{feature.title}</h3>
              <p className="text-[#a0b0a8]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="glass-card p-12 text-center">
          <h2 className="text-3xl font-bold text-[#e8f0eb] mb-4">Ready to Plan Your Next Adventure?</h2>
          <p className="text-lg text-[#a0b0a8] mb-8">
            Join thousands of travelers using TripTribe for their group trips
          </p>
          {!session && (
            <Link
              href="/signup"
              className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-emerald-500 transition"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-[#6b7a72]">
        <p>&copy; 2024 TripTribe. All rights reserved.</p>
      </footer>
    </div>
  );
}