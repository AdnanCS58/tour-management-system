'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiDollarSign,
} from 'react-icons/fi';
import { formatCurrency } from '@/lib/calculations';

interface Settlement {
  _id: string;
  from: {
    _id: string;
    name: string;
    avatar: string;
  };
  to: {
    _id: string;
    name: string;
    avatar: string;
  };
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  note: string;
  createdAt: string;
  confirmedAt: string;
}

interface SettlementTrackerProps {
  tourId: string;
  members: any[];
}

export default function SettlementTracker({ tourId, members }: SettlementTrackerProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    amount: '',
    note: '',
  });

  useEffect(() => {
    fetchSettlements();
  }, [tourId]);

  const fetchSettlements = async () => {
    try {
      const res = await fetch(`/api/tours/${tourId}/settlements`);
      const data = await res.json();
      if (res.ok) {
        setSettlements(data);
      }
    } catch (error) {
      console.error('Error fetching settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSettlement = async () => {
    if (!formData.from || !formData.to || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.from === formData.to) {
      toast.error('Sender and receiver cannot be the same');
      return;
    }

    try {
      const res = await fetch(`/api/tours/${tourId}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (res.ok) {
        toast.success('Settlement created!');
        setShowCreateModal(false);
        setFormData({ from: '', to: '', amount: '', note: '' });
        fetchSettlements();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create settlement');
      }
    } catch (error) {
      toast.error('Failed to create settlement');
    }
  };

  const handleConfirmSettlement = async (settlementId: string) => {
    try {
      const res = await fetch(`/api/settlements/${settlementId}/confirm`, {
        method: 'PUT',
      });

      if (res.ok) {
        toast.success('Settlement confirmed!');
        fetchSettlements();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to confirm settlement');
      }
    } catch (error) {
      toast.error('Failed to confirm settlement');
    }
  };

  const pendingSettlements = settlements.filter(s => s.status === 'pending');
  const completedSettlements = settlements.filter(s => s.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#e8f0eb]">Payment Settlements</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-500 transition flex items-center shadow-lg shadow-emerald-600/20"
        >
          <FiDollarSign className="mr-2" />
          New Settlement
        </button>
      </div>

      {/* Pending Settlements */}
      <div>
        <h3 className="text-lg font-semibold text-[#e8f0eb] mb-4 flex items-center">
          <FiClock className="mr-2 text-orange-400" />
          Pending ({pendingSettlements.length})
        </h3>
        
        {pendingSettlements.length === 0 ? (
          <p className="text-[#6b7a72]">No pending settlements</p>
        ) : (
          <div className="space-y-3">
            {pendingSettlements.map((settlement) => (
              <div key={settlement._id} className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-[#e8f0eb]">{settlement.from.name}</span>
                    <FiArrowRight className="text-[#6b7a72]" />
                    <span className="font-medium text-[#e8f0eb]">{settlement.to.name}</span>
                  </div>
                  <span className="font-bold text-emerald-400 text-lg">
                    {formatCurrency(settlement.amount)}
                  </span>
                </div>
                
                {settlement.note && (
                  <p className="text-sm text-[#a0b0a8] mt-2">{settlement.note}</p>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#6b7a72]">
                    Created: {new Date(settlement.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleConfirmSettlement(settlement._id)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition flex items-center text-sm"
                  >
                    <FiCheck className="mr-2" />
                    Confirm Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Settlements */}
      <div>
        <h3 className="text-lg font-semibold text-[#e8f0eb] mb-4 flex items-center">
          <FiCheckCircle className="mr-2 text-emerald-400" />
          Completed ({completedSettlements.length})
        </h3>
        
        {completedSettlements.length === 0 ? (
          <p className="text-[#6b7a72]">No completed settlements yet</p>
        ) : (
          <div className="space-y-3">
            {completedSettlements.map((settlement) => (
              <div key={settlement._id} className="bg-[#121816]/80 backdrop-blur-lg border border-emerald-600/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-[#e8f0eb]">{settlement.from.name}</span>
                    <FiArrowRight className="text-[#6b7a72]" />
                    <span className="font-medium text-[#e8f0eb]">{settlement.to.name}</span>
                  </div>
                  <span className="font-bold text-emerald-400 text-lg">
                    {formatCurrency(settlement.amount)}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-[#6b7a72]">
                    Confirmed: {settlement.confirmedAt ? new Date(settlement.confirmedAt).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded-full flex items-center">
                    <FiCheckCircle className="mr-1" />
                    Settled
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Settlement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-[#121816] border border-[#2a322e] rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-[#e8f0eb] mb-4">New Settlement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#e8f0eb] mb-2">From (Payer) *</label>
                <select
                  value={formData.from}
                  onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb]"
                >
                  <option value="">Select member</option>
                  {members.map((member) => {
                    const userId = member.user?._id || member.user;
                    return (
                      <option key={userId} value={userId}>
                        {member.user?.name || 'Unknown'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#e8f0eb] mb-2">To (Receiver) *</label>
                <select
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb]"
                >
                  <option value="">Select member</option>
                  {members.map((member) => {
                    const userId = member.user?._id || member.user;
                    return (
                      <option key={userId} value={userId}>
                        {member.user?.name || 'Unknown'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#e8f0eb] mb-2">Amount (৳) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm text-[#e8f0eb] mb-2">Note (optional)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb]"
                  placeholder="Add a note..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-[#1a211e] text-[#a0b0a8] py-2 rounded-lg hover:bg-[#222a26] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSettlement}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500 transition"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}