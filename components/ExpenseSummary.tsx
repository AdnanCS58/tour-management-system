"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiArrowRight,
  FiCheckCircle,
  FiDollarSign,
  FiUsers,
  FiCreditCard,
} from "react-icons/fi";

import {
  calculateBalances,
  calculateWhoOwesWhom,
  formatCurrency,
} from "@/lib/calculations";

interface ExpenseSummaryProps {
  expenses: any[];
  members: any[];
}

export default function ExpenseSummary({
  expenses,
  members,
}: ExpenseSummaryProps) {
  const totalExpense = useMemo(() => {
    return expenses.reduce(
      (sum, expense) => sum + (Number(expense?.amount) || 0),
      0,
    );
  }, [expenses]);

  const balances = useMemo(() => {
    return calculateBalances(expenses, members);
  }, [expenses, members]);

  const settlements = useMemo(() => {
    return calculateWhoOwesWhom(balances);
  }, [balances]);

  const getUserName = (userId: string) => {
    const member = members.find((member: any) => {
      const memberId = member.user?._id || member.user;

      return memberId?.toString() === userId?.toString();
    });

    return member?.user?.name || "Unknown";
  };

  const totalPaid = useMemo(() => {
    return Object.values(balances).reduce(
      (sum, balance) => sum + balance.paid,
      0,
    );
  }, [balances]);

  const totalShare = useMemo(() => {
    return Object.values(balances).reduce(
      (sum, balance) => sum + balance.share,
      0,
    );
  }, [balances]);

  return (
    <div className="space-y-6">
      {/* ========================================= */}
      {/* TOTAL EXPENSE */}
      {/* ========================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="bg-gradient-to-r from-blue-600/40 to-purple-600/40 border border-blue-500/30 rounded-2xl p-6 text-white backdrop-blur-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total Tour Expenses</p>

            <p className="text-3xl font-bold mt-1">
              {formatCurrency(totalExpense)}
            </p>

            <p className="text-sm opacity-75 mt-2">
              {expenses.length} expense
              {expenses.length !== 1 ? "s" : ""} • {members.length} members
            </p>
          </div>

          <FiTrendingUp className="w-12 h-12 opacity-50" />
        </div>
      </motion.div>

      {/* ========================================= */}
      {/* PAYMENT / SHARE SUMMARY */}
      {/* ========================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <FiCreditCard className="text-blue-400" />
            </div>

            <div>
              <p className="text-sm text-[#6b7a72]">Actually Paid</p>

              <p className="text-xl font-bold text-[#e8f0eb]">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <FiDollarSign className="text-emerald-400" />
            </div>

            <div>
              <p className="text-sm text-[#6b7a72]">Total Responsibility</p>

              <p className="text-xl font-bold text-[#e8f0eb]">
                {formatCurrency(totalShare)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* MEMBER BALANCES */}
      {/* ========================================= */}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#e8f0eb] flex items-center">
          <FiUsers className="mr-2 text-emerald-400" />
          Member Balances
        </h3>

        <p className="text-sm text-[#6b7a72]">
          Positive balance means the member should receive money. Negative
          balance means the member owes money.
        </p>

        {members.map((member, index) => {
          const userId = member.user?._id || member.user;

          const id = userId?.toString();

          const memberBalance = balances[id] || {
            paid: 0,
            share: 0,
            balance: 0,
          };

          const isCreditor = memberBalance.balance > 0.01;

          const isDebtor = memberBalance.balance < -0.01;

          return (
            <motion.div
              key={id}
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: index * 0.05,
              }}
              className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-xl p-4 shadow-xl hover:border-[#3a423e] transition"
            >
              <div className="flex items-center justify-between gap-4">
                {/* MEMBER */}

                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">
                      {member.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#e8f0eb] truncate">
                      {member.user?.name || "Unknown"}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                      <span className="text-[#6b7a72]">
                        Paid:{" "}
                        <span className="font-semibold text-[#a0b0a8]">
                          {formatCurrency(memberBalance.paid)}
                        </span>
                      </span>

                      <span className="text-[#6b7a72]">
                        Share:{" "}
                        <span className="font-semibold text-[#a0b0a8]">
                          {formatCurrency(memberBalance.share)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* BALANCE */}

                <div className="text-right ml-4">
                  <p
                    className={`font-semibold text-sm ${
                      isCreditor
                        ? "text-emerald-400"
                        : isDebtor
                          ? "text-red-400"
                          : "text-[#6b7a72]"
                    }`}
                  >
                    {isCreditor
                      ? "Should receive"
                      : isDebtor
                        ? "Owes"
                        : "Settled"}
                  </p>

                  <p
                    className={`font-bold text-lg ${
                      isCreditor
                        ? "text-emerald-400"
                        : isDebtor
                          ? "text-red-400"
                          : "text-[#6b7a72]"
                    }`}
                  >
                    {Math.abs(memberBalance.balance) > 0.01
                      ? formatCurrency(Math.abs(memberBalance.balance))
                      : "৳0.00"}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ========================================= */}
      {/* SETTLEMENT PLAN */}
      {/* ========================================= */}

      <div className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-[#e8f0eb] mb-2 flex items-center">
          <FiDollarSign className="mr-2 text-emerald-400" />
          Settlement Plan
        </h3>

        <p className="text-sm text-[#6b7a72] mb-5">
          These are the minimum payments needed to settle the group's expenses.
        </p>

        {settlements.length > 0 ? (
          <div className="space-y-3">
            {settlements.map((settlement, index) => (
              <motion.div
                key={`${settlement.from}-${settlement.to}-${index}`}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.05,
                }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gradient-to-r from-[#1a211e] to-emerald-900/20 rounded-lg border border-emerald-600/30"
              >
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-medium text-[#e8f0eb]">
                    {getUserName(settlement.from)}
                  </span>

                  <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full">
                    pays
                  </span>

                  <FiArrowRight className="text-[#6b7a72]" />

                  <span className="font-medium text-[#e8f0eb]">
                    {getUserName(settlement.to)}
                  </span>

                  <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded-full">
                    receives
                  </span>
                </div>

                <span className="font-bold text-emerald-400 text-lg">
                  {formatCurrency(settlement.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiCheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />

            <p className="text-[#e8f0eb] font-medium">
              All expenses are settled!
            </p>

            <p className="text-sm text-[#6b7a72] mt-2">
              No payments are needed between members.
            </p>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* EXPENSE BREAKDOWN */}
      {/* ========================================= */}

      {expenses.length > 0 && (
        <div className="bg-[#121816]/80 backdrop-blur-lg border border-[#2a322e] rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-[#e8f0eb] mb-4">
            Expense Breakdown
          </h3>

          <div className="space-y-4">
            {expenses.map((expense, index) => {
              const participants = expense.participants || [];

              return (
                <div
                  key={expense._id || index}
                  className="p-4 bg-[#1a211e] rounded-xl border border-[#2a322e]"
                >
                  {/* Expense header */}

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#e8f0eb]">
                        {expense.title}
                      </p>

                      <p className="text-sm text-[#6b7a72] mt-1">
                        {expense.category}
                      </p>

                      {expense.description && (
                        <p className="text-sm text-[#6b7a72] mt-1">
                          {expense.description}
                        </p>
                      )}
                    </div>

                    <p className="font-bold text-[#e8f0eb] whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>

                  {/* Split type */}

                  <div className="mt-4">
                    <p className="text-sm font-semibold text-[#a0b0a8] mb-2">
                      {expense.splitType === "equal"
                        ? "Equal Share"
                        : "Custom Share"}
                    </p>

                    <div className="space-y-2">
                      {participants.map(
                        (participant: any, participantIndex: number) => {
                          const userId =
                            participant.user?._id || participant.user;

                          const name =
                            participant.user?.name || getUserName(userId);

                          const paid = Number(participant.amountPaid) || 0;

                          const share = Number(participant.share) || 0;

                          const balance = paid - share;

                          return (
                            <div
                              key={participantIndex}
                              className="flex items-center justify-between bg-[#121816] rounded-lg p-3 border border-[#2a322e]"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#e8f0eb]">
                                  {name}
                                </p>

                                <div className="flex flex-wrap gap-3 text-xs text-[#6b7a72] mt-1">
                                  <span>
                                    Paid:{" "}
                                    <span className="font-medium text-[#a0b0a8]">
                                      {formatCurrency(paid)}
                                    </span>
                                  </span>

                                  <span>
                                    Share:{" "}
                                    <span className="font-medium text-[#a0b0a8]">
                                      {formatCurrency(share)}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              <div className="text-right ml-3">
                                {Math.abs(balance) <= 0.01 ? (
                                  <span className="text-xs font-semibold text-[#6b7a72]">
                                    Settled
                                  </span>
                                ) : balance > 0 ? (
                                  <>
                                    <span className="block text-xs text-emerald-400 font-medium">
                                      Receives
                                    </span>

                                    <span className="font-semibold text-emerald-400">
                                      {formatCurrency(balance)}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="block text-xs text-red-400 font-medium">
                                      Owes
                                    </span>

                                    <span className="font-semibold text-red-400">
                                      {formatCurrency(Math.abs(balance))}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
