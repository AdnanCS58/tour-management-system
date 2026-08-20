'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiMapPin, 
  FiCalendar, 
  FiUsers, 
  FiDollarSign, 
  FiPlus,
  FiArrowRight,
  FiCompass,
  FiLogIn,
  FiX
} from 'react-icons/fi';

interface Tour {
  _id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  invitationCode: string;
  owner?: {
    _id?: string;
    name?: string;
  };
  members?: Array<{
    user?: any;
    joinedAt?: string;
  }>;
  expenses?: any[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [stats, setStats] = useState({
    totalTours: 0,
    totalExpenses: 0,
    totalMembers: 0,
    upcomingTrips: 0,
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTours();
    }
  }, [status]);

  const fetchTours = async () => {
    try {
      const res = await fetch('/api/tours');
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        setTours(data);
        
        const totalExpenses = data.reduce((sum: number, tour: Tour) => 
          sum + (tour.expenses?.length || 0), 0);
        const totalMembers = data.reduce((sum: number, tour: Tour) => 
          sum + (tour.members?.length || 0), 0);
        const upcomingTrips = data.filter((tour: Tour) => 
          new Date(tour.startDate) > new Date()).length;

        setStats({
          totalTours: data.length,
          totalExpenses,
          totalMembers,
          upcomingTrips,
        });
      }
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTour = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter invitation code');
      return;
    }

    setJoining(true);
    try {
      const res = await fetch('/api/tours/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationCode: inviteCode.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Successfully joined the tour!');
        setShowJoinModal(false);
        setInviteCode('');
        fetchTours();
        if (data.tour?._id) {
          router.push(`/tours/${data.tour._id}`);
        }
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
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f0d]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a0b0a8]">Loading your tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e8f0eb]">
            Welcome back, <span className="gradient-text">{session?.user?.name}</span>!
          </h1>
          <p className="text-[#a0b0a8] mt-2">Here's what's happening with your tours</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-[#1a211e] text-emerald-400 px-6 py-3 rounded-xl hover:bg-[#222a26] transition flex items-center justify-center border border-emerald-600/30"
          >
            <FiLogIn className="mr-2" />
            Join Tour
          </button>
          <Link
            href="/tours/create"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-500 transition flex items-center shadow-lg shadow-emerald-600/20"
          >
            <FiPlus className="mr-2" />
            Create New Tour
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#a0b0a8]">Total Tours</p>
              <p className="text-3xl font-bold text-[#e8f0eb] mt-1">{stats.totalTours}</p>
            </div>
            <div className="bg-emerald-600/20 p-3 rounded-xl">
              <FiMapPin className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#a0b0a8]">Total Expenses</p>
              <p className="text-3xl font-bold text-[#e8f0eb] mt-1">{stats.totalExpenses}</p>
            </div>
            <div className="bg-blue-600/20 p-3 rounded-xl">
              <FiDollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#a0b0a8]">Total Members</p>
              <p className="text-3xl font-bold text-[#e8f0eb] mt-1">{stats.totalMembers}</p>
            </div>
            <div className="bg-purple-600/20 p-3 rounded-xl">
              <FiUsers className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#a0b0a8]">Upcoming Trips</p>
              <p className="text-3xl font-bold text-[#e8f0eb] mt-1">{stats.upcomingTrips}</p>
            </div>
            <div className="bg-orange-600/20 p-3 rounded-xl">
              <FiCalendar className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tours Grid */}
      <h2 className="text-2xl font-bold text-[#e8f0eb] mb-6">Your Tours</h2>
      
      {tours.length === 0 ? (
        <div className="text-center py-16 bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl shadow-xl">
          <FiCompass className="w-16 h-16 text-[#2a322e] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#e8f0eb] mb-2">No tours yet</h3>
          <p className="text-[#a0b0a8] mb-6">Create a tour or join one with an invitation code!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tours/create"
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-500 transition inline-flex items-center justify-center shadow-lg shadow-emerald-600/20"
            >
              <FiPlus className="mr-2" />
              Create Tour
            </Link>
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-[#1a211e] text-emerald-400 px-6 py-3 rounded-xl hover:bg-[#222a26] transition inline-flex items-center justify-center border border-emerald-600/30"
            >
              <FiLogIn className="mr-2" />
              Join Tour
            </button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour, index) => (
            <motion.div
              key={tour._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl overflow-hidden shadow-xl hover:border-[#3a423e] hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              onClick={() => router.push(`/tours/${tour._id}`)}
            >
              <div className="h-40 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 relative overflow-hidden">
                {tour.coverImage ? (
                  <img 
                    src={tour.coverImage} 
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiMapPin className="w-12 h-12 text-emerald-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121816] to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#e8f0eb] mb-2 group-hover:text-emerald-400 transition">{tour.name}</h3>
                <p className="text-[#a0b0a8] mb-2 flex items-center">
                  <FiMapPin className="mr-1 text-emerald-500" />
                  {tour.destination}
                </p>
                <div className="flex items-center justify-between text-sm text-[#6b7a72]">
                  <span className="flex items-center">
                    <FiCalendar className="mr-1 text-orange-500" />
                    {new Date(tour.startDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <FiUsers className="mr-1 text-purple-500" />
                    {tour.members?.length || 0} members
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-[#2a322e] flex items-center justify-between">
                  <span className="text-xs text-[#6b7a72]">Code: {tour.invitationCode}</span>
                  <span className="text-emerald-400 flex items-center group-hover:translate-x-1 transition-transform">
                    View Details
                    <FiArrowRight className="ml-1" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Join Tour Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#121816] border border-[#2a322e] rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#e8f0eb]">Join a Tour</h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-[#6b7a72] hover:text-[#e8f0eb] transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#a0b0a8] mb-4">Enter the invitation code shared by your friend:</p>
            
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              className="w-full px-4 py-3 bg-[#1a211e] border border-[#2a322e] rounded-xl text-center text-2xl font-bold tracking-widest text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-6"
              maxLength={6}
            />
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setInviteCode('');
                }}
                className="flex-1 bg-[#1a211e] text-[#a0b0a8] py-3 rounded-xl font-semibold hover:bg-[#222a26] transition border border-[#2a322e]"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinTour}
                disabled={joining}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-500 transition disabled:opacity-50 shadow-lg shadow-emerald-600/20"
              >
                {joining ? 'Joining...' : 'Join Tour'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}