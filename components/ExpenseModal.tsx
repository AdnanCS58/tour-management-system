'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiX,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

interface ExpenseModalProps {
  tourId: string;
  members: any[];
  onClose: () => void;
  onExpenseAdded: () => void;
}

const categories = [
  'Hotel/Rent',
  'Car/Transport',
  'Food',
  'Tickets',
  'Shopping',
  'Activities',
  'Other',
];

interface Participant {
  user: string;
  userName: string;
  amountPaid: number;
}

export default function ExpenseModal({
  tourId,
  members,
  onClose,
  onExpenseAdded,
}: ExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');

  const [splitType, setSplitType] = useState<'equal' | 'unequal'>(
    'equal'
  );

  const [unequalParticipants, setUnequalParticipants] = useState<
    Participant[]
  >([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (members.length > 0) {
      const initialParticipants: Participant[] = members.map(
        (member: any) => ({
          user: member.user?._id || member.user,
          userName: member.user?.name || 'Unknown',
          amountPaid: 0,
        })
      );

      setUnequalParticipants(initialParticipants);
    }
  }, [members]);

  const handleSplitTypeChange = (
    type: 'equal' | 'unequal'
  ) => {
    setSplitType(type);

    if (type === 'unequal') {
      const initialParticipants: Participant[] = members.map(
        (member: any) => ({
          user: member.user?._id || member.user,
          userName: member.user?.name || 'Unknown',
          amountPaid: 0,
        })
      );

      setUnequalParticipants(initialParticipants);
    }
  };

  const handleParticipantAmountChange = (
    userId: string,
    value: number
  ) => {
    setUnequalParticipants((prev) =>
      prev.map((participant) =>
        participant.user.toString() === userId.toString()
          ? {
              ...participant,
              amountPaid: Math.max(0, value),
            }
          : participant
      )
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please provide an expense title');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please provide a valid expense amount');
      return;
    }

    if (members.length === 0) {
      toast.error('There are no members in this tour');
      return;
    }

    const totalAmount = parseFloat(amount);

    let participants: any[] = [];

    if (splitType === 'equal') {
      const fairShare = totalAmount / members.length;

      participants = members.map((member: any) => ({
        user: member.user?._id || member.user,
        amountPaid: fairShare,
        share: fairShare,
      }));
    } else {
      const totalPaid = unequalParticipants.reduce(
        (sum, participant) =>
          sum + Number(participant.amountPaid || 0),
        0
      );

      if (Math.abs(totalPaid - totalAmount) > 0.01) {
        toast.error(
          `Total paid (৳${totalPaid.toFixed(
            2
          )}) must equal expense amount (৳${totalAmount.toFixed(
            2
          )})`
        );
        return;
      }

      const fairShare = totalAmount / members.length;

      participants = unequalParticipants.map(
        (participant) => ({
          user: participant.user,
          amountPaid: Number(
            participant.amountPaid || 0
          ),
          share: fairShare,
        })
      );
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/tours/${tourId}/expenses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            category,
            amount: totalAmount,
            date,
            description: description.trim(),
            splitType,
            participants,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.error || 'Failed to add expense'
        );
        return;
      }

      toast.success('Expense added successfully!');

      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error(
        'Error adding expense:',
        error
      );

      toast.error(
        'Something went wrong while adding the expense'
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPaidInUnequal =
    unequalParticipants.reduce(
      (sum, participant) =>
        sum + Number(participant.amountPaid || 0),
      0
    );

  const numericAmount = parseFloat(amount || '0');

  const fairShare =
    members.length > 0 && numericAmount > 0
      ? numericAmount / members.length
      : 0;

  const remainingAmount =
    numericAmount - totalPaidInUnequal;

  const paymentIsCorrect =
    Math.abs(remainingAmount) <= 0.01;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{
            scale: 0.95,
            y: 20,
          }}
          animate={{
            scale: 1,
            y: 0,
          }}
          exit={{
            scale: 0.95,
            y: 20,
          }}
          className="bg-[#121816] border border-[#2a322e] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {/* Header */}
          <div className="p-6 border-b border-[#2a322e] flex justify-between items-center sticky top-0 bg-[#121816] z-10">
            <div>
              <h2 className="text-2xl font-bold text-[#e8f0eb]">
                Add Expense
              </h2>

              <p className="text-sm text-[#6b7a72] mt-1">
                Record who paid and how much
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[#1a211e] rounded-full transition text-[#6b7a72] hover:text-[#e8f0eb]"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Expense Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
                className="w-full px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="e.g. Car Rent"
              />
            </div>

            {/* Category + Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                  Category *
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb] focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                  Total Amount (৳) *
                </label>

                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a72]" />

                  <input
                    type="number"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="3000"
                  />
                </div>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Date *
              </label>

              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7a72]" />

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb] focus:ring-2 focus:ring-emerald-500 outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Split Type */}
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Expense Distribution
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Equal */}
                <button
                  type="button"
                  onClick={() =>
                    handleSplitTypeChange(
                      'equal'
                    )
                  }
                  className={`px-4 py-4 rounded-xl border-2 text-left transition ${
                    splitType === 'equal'
                      ? 'border-emerald-500 bg-emerald-600/10'
                      : 'border-[#2a322e] bg-[#1a211e] hover:border-[#3a423e]'
                  }`}
                >
                  <span
                    className={`block font-semibold ${
                      splitType === 'equal'
                        ? 'text-emerald-400'
                        : 'text-[#e8f0eb]'
                    }`}
                  >
                    Equal Payment
                  </span>

                  <span className="block text-xs text-[#6b7a72] mt-1">
                    Everyone pays their fair share
                  </span>

                  {numericAmount > 0 && (
                    <span className="block text-sm font-semibold text-emerald-400 mt-2">
                      ৳{fairShare.toFixed(2)} each
                    </span>
                  )}
                </button>

                {/* Unequal */}
                <button
                  type="button"
                  onClick={() =>
                    handleSplitTypeChange(
                      'unequal'
                    )
                  }
                  className={`px-4 py-4 rounded-xl border-2 text-left transition ${
                    splitType === 'unequal'
                      ? 'border-emerald-500 bg-emerald-600/10'
                      : 'border-[#2a322e] bg-[#1a211e] hover:border-[#3a423e]'
                  }`}
                >
                  <span
                    className={`block font-semibold ${
                      splitType === 'unequal'
                        ? 'text-emerald-400'
                        : 'text-[#e8f0eb]'
                    }`}
                  >
                    Different Payments
                  </span>

                  <span className="block text-xs text-[#6b7a72] mt-1">
                    Members can pay different amounts
                  </span>

                  <span className="block text-xs text-[#6b7a72] mt-2">
                    Share remains equal
                  </span>
                </button>
              </div>
            </div>

            {/* Equal Split Information */}
            {splitType === 'equal' &&
              numericAmount > 0 && (
                <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />

                    <div>
                      <p className="font-semibold text-emerald-400">
                        Equal distribution
                      </p>

                      <p className="text-sm text-[#a0b0a8] mt-1">
                        Total ৳
                        {numericAmount.toFixed(
                          2
                        )}{' '}
                        will be divided among{' '}
                        {members.length} members.
                      </p>

                      <p className="text-sm font-semibold text-emerald-400 mt-1">
                        Each member: ৳
                        {fairShare.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* Unequal Payment */}
            {splitType === 'unequal' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#e8f0eb] flex items-center">
                    <FiUsers className="mr-2 text-emerald-400" />

                    Actual Payment
                  </h3>

                  <p className="text-sm text-[#6b7a72] mt-1">
                    Enter how much each member actually
                    paid. The system will automatically
                    calculate everyone's fair share.
                  </p>
                </div>

                {/* Fair Share */}
                {numericAmount > 0 && (
                  <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
                    <p className="text-sm text-blue-400">
                      Fair share per member
                    </p>

                    <p className="text-xl font-bold text-blue-400">
                      ৳{fairShare.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Members */}
                <div className="space-y-3">
                  {unequalParticipants.map(
                    (participant) => (
                      <div
                        key={participant.user}
                        className="flex items-center gap-3 bg-[#1a211e] border border-[#2a322e] p-3 rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold">
                            {participant.userName
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              '?'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#e8f0eb] truncate">
                            {
                              participant.userName
                            }
                          </p>

                          <p className="text-xs text-[#6b7a72]">
                            Share: ৳
                            {fairShare.toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <div className="relative w-32">
                          <input
                            type="number"
                            value={
                              participant.amountPaid ===
                              0
                                ? ''
                                : participant.amountPaid
                            }
                            onChange={(e) =>
                              handleParticipantAmountChange(
                                participant.user,
                                parseFloat(
                                  e.target.value
                                ) || 0
                              )
                            }
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 pr-8 bg-[#0a0f0d] border border-[#2a322e] rounded-lg text-[#e8f0eb] focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0"
                          />

                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a72] text-sm">
                            ৳
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Payment Summary */}
                <div
                  className={`rounded-xl p-4 border ${
                    paymentIsCorrect
                      ? 'bg-emerald-600/10 border-emerald-600/30'
                      : 'bg-red-600/10 border-red-600/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#e8f0eb]">
                      Total Paid
                    </span>

                    <span
                      className={`font-bold ${
                        paymentIsCorrect
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      ৳
                      {totalPaidInUnequal.toFixed(
                        2
                      )}
                      {' / '}
                      ৳
                      {numericAmount.toFixed(
                        2
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-[#a0b0a8]">
                      Remaining
                    </span>

                    <span
                      className={`font-semibold ${
                        paymentIsCorrect
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      ৳
                      {Math.abs(
                        remainingAmount
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-2">
                    {paymentIsCorrect ? (
                      <>
                        <FiCheckCircle className="text-emerald-400 mt-0.5" />

                        <p className="text-sm text-emerald-400">
                          Payment amounts are correct.
                          The system will calculate who
                          owes whom automatically.
                        </p>
                      </>
                    ) : (
                      <>
                        <FiAlertCircle className="text-red-400 mt-0.5" />

                        <p className="text-sm text-red-400">
                          Total payment must equal the
                          expense amount.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#e8f0eb] mb-2">
                Description (optional)
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 bg-[#1a211e] border border-[#2a322e] rounded-lg text-[#e8f0eb] placeholder-[#6b7a72] focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Add any notes about this expense..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                loading ||
                (splitType === 'unequal' &&
                  !paymentIsCorrect)
              }
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
            >
              {loading
                ? 'Adding...'
                : 'Add Expense'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}