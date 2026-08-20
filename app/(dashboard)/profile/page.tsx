'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiSave, 
  FiShare2, 
  FiMapPin, 
  FiCalendar, 
  FiUsers,
  FiUpload,
  FiX,
  FiArrowRight
} from 'react-icons/fi';

interface Tour {
  _id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  contactInfo: string;
  shareContact: boolean;
  isAdmin: boolean;
  tours: Tour[];
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    contactInfo: '',
    shareContact: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    console.log('🔵 Fetching profile...');
    
    try {
      const res = await fetch('/api/user/profile');
      console.log('📡 Response status:', res.status);
      
      const data = await res.json();
      console.log('📡 Profile data:', data);

      if (res.ok) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          avatar: data.avatar || '',
          contactInfo: data.contactInfo || '',
          shareContact: data.shareContact || false,
        });
      } else {
        console.error('❌ Failed to load profile:', data.error);
        toast.error(data.error || 'Failed to load profile');
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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
      setFormData({ ...formData, avatar: base64String });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f0d]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a0b0a8]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-[#e8f0eb] mb-8">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl h-fit"
        >
          <div className="text-center">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-emerald-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">
                  {formData.name?.charAt(0) || session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <h2 className="text-xl font-bold text-[#e8f0eb]">{formData.name || 'User'}</h2>
            <p className="text-[#a0b0a8]">{profile?.email || session?.user?.email}</p>
            {profile?.isAdmin && (
              <span className="inline-block mt-2 bg-purple-600/20 text-purple-400 text-xs px-3 py-1 rounded-full">
                Admin
              </span>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-[#2a322e]">
            <h3 className="text-sm font-semibold text-[#e8f0eb] mb-3">Account Info</h3>
            <div className="space-y-2 text-sm text-[#a0b0a8]">
              <p className="flex items-center">
                <FiUsers className="mr-2 text-emerald-400" />
                {profile?.tours?.length || 0} Tours
              </p>
              <p className="flex items-center">
                <FiCalendar className="mr-2 text-orange-400" />
                Joined: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
              {formData.contactInfo && (
                <p className="flex items-center">
                  <FiPhone className="mr-2 text-blue-400" />
                  {formData.contactInfo}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-2 bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-xl font-bold text-[#e8f0eb] mb-6">Edit Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {formData.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition"
                >
                  <FiUpload className="mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
                {formData.avatar && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: '' })}
                    className="text-red-400 hover:text-red-500"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
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

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b7a72]" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Email (cannot be changed)
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b7a72]" />
                <input
                  type="email"
                  value={profile?.email || session?.user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2 bg-[#0a0f0d] border border-[#2a322e] rounded-lg text-[#6b7a72] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Contact Information
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b7a72]" />
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Phone number, WhatsApp, etc."
                />
              </div>
            </div>

            {/* Share Contact */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.shareContact}
                onChange={(e) => setFormData({ ...formData, shareContact: e.target.checked })}
                className="w-4 h-4 text-emerald-500 bg-[#1a211e] border-[#2a322e] rounded focus:ring-emerald-500 focus:ring-2"
              />
              <label className="text-sm text-[#a0b0a8] flex items-center">
                <FiShare2 className="mr-2 text-emerald-400" />
                Share contact information with tour members
              </label>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-500 transition disabled:opacity-50 flex items-center shadow-lg shadow-emerald-600/20"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <FiSave className="mr-2" />
              )}
              Save Changes
            </button>
          </form>
        </motion.div>
      </div>

      {/* My Tours Section */}
      {profile?.tours && profile.tours.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#e8f0eb] mb-6">My Tours</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {profile.tours.map((tour) => (
              <Link
                key={tour._id}
                href={`/tours/${tour._id}`}
                className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl hover:border-[#3a423e] hover:shadow-2xl transition"
              >
                <h3 className="font-bold text-[#e8f0eb] mb-2">{tour.name}</h3>
                <p className="text-[#a0b0a8] flex items-center mb-2">
                  <FiMapPin className="mr-1 text-emerald-400" />
                  {tour.destination}
                </p>
                <p className="text-sm text-[#6b7a72] flex items-center">
                  <FiCalendar className="mr-1 text-orange-400" />
                  {new Date(tour.startDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}
                </p>
                <div className="mt-3 pt-3 border-t border-[#2a322e] flex items-center justify-between">
                  <span className="text-xs text-[#6b7a72]">View Details</span>
                  <FiArrowRight className="text-emerald-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}