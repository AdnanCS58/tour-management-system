'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiDownload,
  FiX,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiFileText,
} from 'react-icons/fi';

interface TourReportProps {
  tourId: string;
  onClose: () => void;
}

export default function TourReport({ tourId, onClose }: TourReportProps) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tours/${tourId}/report`);
      const data = await res.json();
      if (res.ok) {
        setReportData(data);
        generatePDF(data);
      } else {
        toast.error(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (data: any) => {
    // Create a new window for the report
    const reportWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!reportWindow) {
      toast.error('Please allow popups to download the report');
      return;
    }

    const html = generateReportHTML(data);
    reportWindow.document.write(html);
    reportWindow.document.close();
    
    // Auto trigger print
    setTimeout(() => {
      reportWindow.print();
    }, 500);
  };

  const generateReportHTML = (data: any) => {
    const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;
    const formatDate = (date: string) => new Date(date).toLocaleDateString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tour Report - ${data.tour.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
          .report-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .report-header { background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 40px; }
          .report-header h1 { font-size: 28px; margin-bottom: 8px; }
          .report-header p { opacity: 0.9; font-size: 14px; }
          .report-body { padding: 40px; }
          .section { margin-bottom: 32px; }
          .section-title { font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #059669; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .info-item { background: #f9fafb; padding: 16px; border-radius: 8px; }
          .info-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
          .info-value { font-size: 16px; font-weight: 600; color: #111827; }
          .member-card { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px; }
          .member-avatar { width: 40px; height: 40px; border-radius: 50%; background: #059669; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
          .member-info { flex: 1; }
          .member-name { font-weight: 600; color: #111827; }
          .member-email { font-size: 12px; color: #6b7280; }
          .expense-card { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 12px; }
          .expense-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
          .expense-title { font-weight: 600; color: #111827; }
          .expense-amount { font-size: 18px; font-weight: bold; color: #059669; }
          .expense-details { font-size: 12px; color: #6b7280; }
          .balance-positive { color: #059669; font-weight: bold; }
          .balance-negative { color: #dc2626; font-weight: bold; }
          .total-card { background: linear-gradient(135deg, #059669, #0d9488); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
          .total-card h3 { font-size: 14px; opacity: 0.9; }
          .total-card p { font-size: 32px; font-weight: bold; margin-top: 4px; }
          .report-footer { text-align: center; padding: 20px; background: #f9fafb; font-size: 12px; color: #6b7280; }
          @media print {
            body { background: white; padding: 0; }
            .report-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <h1>${data.tour.name}</h1>
            <p>📅 ${formatDate(data.tour.startDate)} - ${formatDate(data.tour.endDate)}</p>
            <p>📍 ${data.tour.destination}</p>
          </div>
          
          <div class="report-body">
            <div class="total-card">
              <h3>Total Tour Expenses</h3>
              <p>${formatCurrency(data.totalExpenses)}</p>
            </div>

            <div class="section">
              <h2 class="section-title">Tour Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Tour Name</div>
                  <div class="info-value">${data.tour.name}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Destination</div>
                  <div class="info-value">${data.tour.destination}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Start Date</div>
                  <div class="info-value">${formatDate(data.tour.startDate)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">End Date</div>
                  <div class="info-value">${formatDate(data.tour.endDate)}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Invitation Code</div>
                  <div class="info-value">${data.tour.invitationCode}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Total Members</div>
                  <div class="info-value">${data.members.length}</div>
                </div>
              </div>
              ${data.tour.description ? `
                <div class="info-item" style="margin-top: 16px;">
                  <div class="info-label">Description</div>
                  <div class="info-value" style="font-weight: normal; font-size: 14px;">${data.tour.description}</div>
                </div>
              ` : ''}
            </div>

            <div class="section">
              <h2 class="section-title">Tour Owner</h2>
              <div class="member-card">
                <div class="member-avatar">${data.owner?.name?.charAt(0) || '?'}</div>
                <div class="member-info">
                  <div class="member-name">${data.owner?.name || 'Unknown'}</div>
                  <div class="member-email">${data.owner?.email || ''}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Members (${data.members.length})</h2>
              ${data.members.map((member: any) => `
                <div class="member-card">
                  <div class="member-avatar">${member.user?.name?.charAt(0) || '?'}</div>
                  <div class="member-info">
                    <div class="member-name">${member.user?.name || 'Unknown'}</div>
                    <div class="member-email">${member.user?.email || ''}</div>
                  </div>
                  <div>
                    ${data.balances[member.user?._id?.toString()]?.balance > 0 
                      ? `<span class="balance-positive">Receives ${formatCurrency(data.balances[member.user?._id?.toString()].balance)}</span>`
                      : data.balances[member.user?._id?.toString()]?.balance < 0
                        ? `<span class="balance-negative">Owes ${formatCurrency(Math.abs(data.balances[member.user?._id?.toString()].balance))}</span>`
                        : '<span style="color: #6b7280;">Settled</span>'
                    }
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="section">
              <h2 class="section-title">Expenses (${data.expenses.length})</h2>
              ${data.expenses.map((expense: any) => `
                <div class="expense-card">
                  <div class="expense-header">
                    <span class="expense-title">${expense.title}</span>
                    <span class="expense-amount">${formatCurrency(expense.amount)}</span>
                  </div>
                  <div class="expense-details">
                    Category: ${expense.category} | Date: ${formatDate(expense.date)} | Split: ${expense.splitType === 'equal' ? 'Equal' : 'Custom'}
                  </div>
                  ${expense.participants?.length ? `
                    <div style="margin-top: 8px; font-size: 12px;">
                      ${expense.participants.map((p: any) => `
                        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-top: 1px solid #e5e7eb;">
                          <span>${p.user?.name || 'Unknown'}</span>
                          <span>Paid: ${formatCurrency(p.amountPaid)} | Share: ${formatCurrency(p.share)}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="report-footer">
            Report generated on ${new Date(data.generatedAt).toLocaleString()} | TripTribe Tour Management System
          </div>
        </div>
      </body>
      </html>
    `;
  };

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
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-[#121816] border border-[#2a322e] rounded-2xl max-w-md w-full p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#e8f0eb]">Download Tour Report</h3>
            <button onClick={onClose} className="text-[#6b7a72] hover:text-[#e8f0eb]">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-[#1a211e] p-4 rounded-xl border border-[#2a322e]">
              <p className="text-sm text-[#a0b0a8] mb-3">This report includes:</p>
              <ul className="space-y-2 text-sm text-[#e8f0eb]">
                <li className="flex items-center">
                  <FiFileText className="mr-2 text-emerald-400" />
                  Tour Information
                </li>
                <li className="flex items-center">
                  <FiUsers className="mr-2 text-blue-400" />
                  Member List with Balances
                </li>
                <li className="flex items-center">
                  <FiDollarSign className="mr-2 text-emerald-400" />
                  Detailed Expense Breakdown
                </li>
                <li className="flex items-center">
                  <FiCalendar className="mr-2 text-orange-400" />
                  Dates and Schedule
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-500 transition disabled:opacity-50 flex items-center justify-center shadow-lg shadow-emerald-600/20"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiDownload className="mr-2" />
                Generate Report
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}