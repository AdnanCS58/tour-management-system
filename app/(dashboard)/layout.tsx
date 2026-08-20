'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  FiHome,
  FiMap,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiPlus,
  FiCompass
} from 'react-icons/fi';
import NotificationsDropdown from '@/components/NotificationsDropdown';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f0d]">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'My Tours', href: '/tours', icon: FiMap },
    { name: 'Profile', href: '/profile', icon: FiUser },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f0d] leaf-pattern">
      {/* Top Navigation */}
      <nav className="bg-[#121816]/80 backdrop-blur-lg border-b border-[#2a322e] sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FiCompass className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">TripTribe</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg transition ${
                    pathname === item.href
                      ? 'bg-emerald-600/20 text-emerald-400'
                      : 'text-[#a0b0a8] hover:bg-[#1a211e] hover:text-[#e8f0eb]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <NotificationsDropdown />

              <Link
                href="/tours/create"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition flex items-center"
              >
                <FiPlus className="mr-2" />
                New Tour
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-2 px-3 py-2 text-[#a0b0a8] hover:bg-[#1a211e] hover:text-[#e8f0eb] rounded-lg transition"
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#a0b0a8] hover:bg-[#1a211e]"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2a322e] bg-[#121816]">
            <div className="px-6 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-[#a0b0a8] hover:bg-[#1a211e] hover:text-[#e8f0eb] rounded-lg"
                >
                  {item.name}
                </Link>
              ))}

              <div className="px-3 py-2">
                <NotificationsDropdown />
              </div>

              <Link
                href="/tours/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 bg-emerald-600 text-white rounded-lg"
              >
                New Tour
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full text-left px-3 py-2 text-[#a0b0a8] hover:bg-[#1a211e] hover:text-[#e8f0eb] rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="py-8">{children}</main>
    </div>
  );
}