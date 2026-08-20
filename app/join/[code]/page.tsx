'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMapPin, FiUsers, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Link from 'next/link';

export default function JoinTourPage() {
  const { code } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tourInfo, setTourInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (code) {
      fetchTourInfo();
    }
  }, [code]);

  const fetchTourInfo = async () => {
    try {
      // This would need a public API endpoint to get tour info by code
      const res = await fetch(`/api/tours/join-info/${code}`);
      if (res.ok) {
        const data = await res.json();
        setTourInfo(data);
      } else {
        toast.error('Invalid invitation code');
      }
    } catch (error) {
      toast.error('Failed to load tour information');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!session) {
      router.push(`/login?redirect=/join/${code}`);
      return;
    }

    setJoining(true);
    try {
      const res = await fetch('/api/tours/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationCode: code }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Successfully joined the tour!');
        router.push(`/tours/${data.tour._id}`);
      } else {
        toast.error(data.error || 'Failed to join tour');
      }
    } catch (error) {
      toast.error('Failed to join tour');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {tourInfo ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <FiMapPin className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Join Tour</h1>
                <p className="text-gray-600 mt-2">You've been invited to join:</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{tourInfo.name}</h2>
                <div className="space-y-3 text-gray-600">
                  <p className="flex items-center">
                    <FiMapPin className="mr-2" />
                    {tourInfo.destination}
                  </p>
                  <p className="flex items-center">
                    <FiCalendar className="mr-2" />
                    {new Date(tourInfo.startDate).toLocaleDateString()} - {new Date(tourInfo.endDate).toLocaleDateString()}
                  </p>
                  <p className="flex items-center">
                    <FiUsers className="mr-2" />
                    {tourInfo.members?.length || 0} members
                  </p>
                </div>
              </div>

              {status === 'authenticated' ? (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {joining ? 'Joining...' : 'Join Tour'}
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-gray-600">Please login to join this tour</p>
                  <Link
                    href={`/login?redirect=/join/${code}`}
                    className="block w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition text-center"
                  >
                    Login to Join
                  </Link>
                  <Link
                    href={`/signup?redirect=/join/${code}`}
                    className="block w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
              <p className="text-gray-600 mb-6">This invitation code is invalid or has expired.</p>
              <Link
                href="/"
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-700 transition"
              >
                Go Home
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}