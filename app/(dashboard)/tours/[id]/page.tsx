"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiShare2,
  FiPlus,
  FiArrowLeft,
  FiTrash2,
  FiNavigation,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiMessageCircle,
} from "react-icons/fi";
import ExpenseModal from "@/components/ExpenseModal";
import ExpenseSummary from "@/components/ExpenseSummary";
import DocumentsTab from "@/components/DocumentsTab";
import WeatherWidget from "@/components/WeatherWidget";
import SettlementTracker from "@/components/SettlementTracker";
import TourReport from "@/components/TourReport";
import ImageSlideshow from "@/components/ImageSlideshow";
import TourChat from "@/components/TourChat";

// Dynamic import for map
const TourMap = dynamic(() => import("@/components/TourMap"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-[#121816] animate-pulse rounded-2xl flex items-center justify-center border border-[#2a322e]">
      <p className="text-[#6b7a72]">Loading map...</p>
    </div>
  ),
});

interface TourData {
  _id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  invitationCode: string;
  coverImage?: string;
  coverImages?: string[];
  owner?: any;
  members?: any[];
  expenses?: any[];
  settledPayments?: any[];
}

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const [tour, setTour] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "expenses" | "members" | "map" | "documents" | "settlements"
  >("overview");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [totalOthersMessages, setTotalOthersMessages] = useState(0);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const tourId = params?.id as string;

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`/api/tours/${tourId}/messages/unread`);
      const data = await res.json();
      if (res.ok) {
        setTotalOthersMessages(data.totalOthersMessages || 0);

        // Get last seen count from localStorage
        const storedLastSeen = localStorage.getItem(`lastSeen_${tourId}`);
        const lastSeen = storedLastSeen ? parseInt(storedLastSeen) : 0;

        // Unread = total messages from others - last seen count
        const unread = Math.max(0, data.totalOthersMessages - lastSeen);
        setUnreadMessages(unread);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleOpenChat = () => {
    setShowChat(true);
    setUnreadMessages(0);
    // Save current total as last seen
    localStorage.setItem(`lastSeen_${tourId}`, totalOthersMessages.toString());
  };

  const handleCloseChat = () => {
    setShowChat(false);
    // Save current total as last seen when closing
    localStorage.setItem(`lastSeen_${tourId}`, totalOthersMessages.toString());
    setUnreadMessages(0);
  };

  useEffect(() => {
    if (tourId) {
      fetchTour();
    }
  }, [tourId]);

  useEffect(() => {
    if (!tourId || showChat) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [tourId, showChat]);

  // Watch location when sharing is enabled
  useEffect(() => {
    if (locationSharing && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          updateLocation(newLocation.lat, newLocation.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Failed to get location. Please enable location services.",
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [locationSharing, tourId]);

  const fetchTour = async () => {
    try {
      const res = await fetch(`/api/tours/${tourId}`);
      const data = await res.json();

      if (res.ok) {
        setTour(data);

        const currentMember = data.members?.find(
          (m: any) =>
            m.user?._id === session?.user?.id || m.user === session?.user?.id,
        );
        if (currentMember) {
          setLocationSharing(currentMember.locationSharing || false);
          if (currentMember.lastLocation?.lat) {
            setUserLocation({
              lat: currentMember.lastLocation.lat,
              lng: currentMember.lastLocation.lng,
            });
          }
        }
      } else {
        toast.error(data.error || "Failed to load tour");
      }
    } catch (error) {
      console.error("Error fetching tour:", error);
      toast.error("Failed to load tour");
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    try {
      await fetch(`/api/tours/${tourId}/location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const toggleLocationSharing = async () => {
    try {
      const res = await fetch(`/api/tours/${tourId}/location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !locationSharing }),
      });

      if (res.ok) {
        setLocationSharing(!locationSharing);
        toast.success(
          `Location sharing ${!locationSharing ? "enabled" : "disabled"}`,
        );

        if (!locationSharing && "geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setUserLocation(newLocation);
              updateLocation(newLocation.lat, newLocation.lng);
            },
            (error) => {
              console.error("Error getting location:", error);
              toast.error("Failed to get your location");
            },
          );
        }
      } else {
        toast.error("Failed to update location sharing");
      }
    } catch (error) {
      toast.error("Failed to update location sharing");
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${tour?.invitationCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Invitation link copied!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f0d]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#a0b0a8]">Loading tour...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f0d]">
        <p className="text-xl text-[#a0b0a8] mb-4">Tour not found</p>
        <Link href="/dashboard" className="text-emerald-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOwner =
    tour.owner?._id === session?.user?.id || tour.owner === session?.user?.id;
  const totalExpenses =
    tour.expenses?.reduce(
      (sum: number, exp: any) => sum + (exp.amount || 0),
      0,
    ) || 0;

  return (
    <>
      <div className="container mx-auto px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-[#a0b0a8] hover:text-[#e8f0eb] mb-6 transition"
        >
          <FiArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>

        {/* Tour Header */}
        <div className="bg-gradient-to-r from-emerald-600/40 to-teal-600/40 border border-emerald-600/30 rounded-3xl p-8 text-white mb-8 backdrop-blur-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {tour.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center">
                  <FiMapPin className="mr-1" />
                  {tour.destination}
                </span>
                {tour.startDate && (
                  <span className="flex items-center">
                    <FiCalendar className="mr-1" />
                    {new Date(tour.startDate).toLocaleDateString()} -{" "}
                    {new Date(tour.endDate).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center">
                  <FiUsers className="mr-1" />
                  {tour.members?.length || 0} members
                </span>
                <span className="flex items-center">
                  <FiDollarSign className="mr-1" />৳{totalExpenses.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex space-x-3 mt-4 md:mt-0">
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-white/10 hover:bg-white/20 transition p-3 rounded-xl border border-white/20"
              >
                <FiShare2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-white/10 hover:bg-white/20 transition p-3 rounded-xl border border-white/20"
                title="Download Report"
              >
                <FiDownload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {(tour.coverImages?.length > 0 || tour.coverImage) && (
          <div className="mb-8">
            <ImageSlideshow
              images={
                tour.coverImages?.length > 0
                  ? tour.coverImages
                  : [tour.coverImage]
              }
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-[#2a322e] overflow-x-auto">
          {[
            { key: "overview", label: "Overview" },
            { key: "expenses", label: "Expenses" },
            { key: "members", label: "Members" },
            { key: "map", label: "Map" },
            { key: "documents", label: "Documents" },
            { key: "settlements", label: "Settlements" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 font-medium transition whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-[#6b7a72] hover:text-[#e8f0eb]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content sections */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {tour.description && (
              <div className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-[#e8f0eb] mb-4">
                  About This Tour
                </h2>
                <p className="text-[#a0b0a8]">{tour.description}</p>
              </div>
            )}

            <WeatherWidget destination={tour.destination} />

            <ExpenseSummary
              expenses={tour.expenses || []}
              members={tour.members || []}
            />
          </motion.div>
        )}

        {activeTab === "expenses" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#e8f0eb]">Expenses</h2>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-500 transition flex items-center shadow-lg shadow-emerald-600/20"
              >
                <FiPlus className="mr-2" />
                Add Expense
              </button>
            </div>

            {!tour.expenses || tour.expenses.length === 0 ? (
              <div className="text-center py-12 bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl shadow-xl">
                <FiDollarSign className="w-16 h-16 text-[#2a322e] mx-auto mb-4" />
                <p className="text-[#a0b0a8]">No expenses added yet</p>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="mt-4 text-emerald-400 hover:underline"
                >
                  Add your first expense
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tour.expenses.map((expense: any, index: number) => (
                  <motion.div
                    key={expense._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl hover:border-[#3a423e] transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#e8f0eb]">
                          {expense.title}
                        </h3>
                        <p className="text-sm text-[#6b7a72]">
                          {expense.category}
                        </p>
                        {expense.description && (
                          <p className="text-sm text-[#a0b0a8] mt-2">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-[#e8f0eb]">
                        ৳{expense.amount?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-[#6b7a72]">
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 text-xs text-[#6b7a72]">
                      {expense.splitType === "equal"
                        ? "Equal split"
                        : "Custom split"}{" "}
                      •{expense.participants?.length || 0} participants
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "members" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {tour.members?.map((member: any, index: number) => (
              <div
                key={member.user?._id || index}
                className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl hover:border-[#3a423e] transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {member.user?.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-[#e8f0eb]">
                          {member.user?.name || "Unknown"}
                        </p>
                        {isOwner && (
                          <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded-full">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#6b7a72]">
                        {member.user?.email || "No email"}
                      </p>
                    </div>
                  </div>
                  {member.locationSharing && (
                    <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded-full flex items-center">
                      <FiNavigation className="mr-1" />
                      Sharing Location
                    </span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "map" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                  <h2 className="text-xl font-bold text-[#e8f0eb]">
                    Live Locations
                  </h2>
                  <p className="text-sm text-[#6b7a72] mt-1">
                    See where your tour members are in real-time
                  </p>
                </div>
                <button
                  onClick={toggleLocationSharing}
                  className={`flex items-center px-4 py-2 rounded-xl transition ${
                    locationSharing
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "bg-[#1a211e] text-[#a0b0a8] hover:bg-[#222a26] hover:text-[#e8f0eb] border border-[#2a322e]"
                  }`}
                >
                  {locationSharing ? (
                    <FiEye className="mr-2" />
                  ) : (
                    <FiEyeOff className="mr-2" />
                  )}
                  {locationSharing
                    ? "Location Sharing ON"
                    : "Location Sharing OFF"}
                </button>
              </div>
            </div>

            <TourMap
              members={tour.members || []}
              userLocation={userLocation}
              locationSharing={locationSharing}
              currentUserId={session?.user?.id || ""}
            />
          </motion.div>
        )}

        {activeTab === "documents" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DocumentsTab tourId={tour._id} />
          </motion.div>
        )}

        {activeTab === "settlements" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SettlementTracker tourId={tour._id} members={tour.members || []} />
          </motion.div>
        )}

        {/* Modals */}
        {showExpenseModal && (
          <ExpenseModal
            tourId={tour._id}
            members={tour.members || []}
            onClose={() => setShowExpenseModal(false)}
            onExpenseAdded={fetchTour}
          />
        )}

        {showInviteModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#121816] border border-[#2a322e] rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-[#e8f0eb] mb-4">
                Invite Members
              </h3>
              <div className="bg-[#1a211e] p-4 rounded-xl mb-4 border border-[#2a322e]">
                <p className="text-2xl font-bold text-center text-emerald-400 tracking-widest">
                  {tour.invitationCode}
                </p>
              </div>
              <button
                onClick={copyInviteLink}
                className="w-full bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-500 transition mb-2 shadow-lg shadow-emerald-600/20"
              >
                Copy Invite Link
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full bg-[#1a211e] text-[#a0b0a8] py-2 rounded-xl hover:bg-[#222a26] hover:text-[#e8f0eb] transition border border-[#2a322e]"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {showReportModal && (
          <TourReport
            tourId={tour._id}
            onClose={() => setShowReportModal(false)}
          />
        )}
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={handleOpenChat}
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-500 transition-all duration-300 hover:scale-110 shadow-emerald-600/30"
        style={{ position: "fixed", bottom: "24px", right: "24px" }}
        title="Group Chat"
      >
        <FiMessageCircle className="w-6 h-6" />
        {unreadMessages > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {unreadMessages > 9 ? "9+" : unreadMessages}
          </span>
        )}
      </button>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="bg-[#121816] border border-[#2a322e] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md h-[80vh] sm:h-[600px] shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-[#2a322e] flex items-center bg-[#121816]">
              <FiMessageCircle className="text-emerald-400 mr-2" />
              <h3 className="font-semibold text-[#e8f0eb]">Group Chat</h3>
              <button
                onClick={handleCloseChat}
                className="ml-auto text-[#6b7a72] hover:text-[#e8f0eb] transition"
              >
                ✕
              </button>
            </div>
            <div className="h-[calc(80vh-56px)] sm:h-[calc(600px-56px)]">
              <TourChat
                tourId={tour._id}
                currentUserId={session?.user?.id || ""}
                onMessagesRead={() => setUnreadMessages(0)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}