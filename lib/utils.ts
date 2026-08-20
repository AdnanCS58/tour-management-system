import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateInvitationCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatCurrency(amount: number): string {
  return `৳${amount.toFixed(2)}`;
}

export function calculateBalances(expenses: any[], members: any[]) {
  const balances: { [key: string]: { paid: number; share: number; balance: number } } = {};
  
  // Initialize balances for all members
  members.forEach((member: any) => {
    const userId = member?.user?._id || member?.user;
    if (userId) {
      balances[userId] = { paid: 0, share: 0, balance: 0 };
    }
  });

  // Calculate from expenses
  expenses.forEach((expense: any) => {
    if (!expense) return;
    
    const totalAmount = expense.amount || 0;
    
    if (expense.splitType === 'equal') {
      // Equal split: everyone shares equally
      const fairShare = totalAmount / members.length;
      
      // Add to everyone's share
      members.forEach((member: any) => {
        const userId = member?.user?._id || member?.user;
        if (userId && balances[userId]) {
          balances[userId].share += fairShare;
        }
      });
      
      // Add full amount to payer's paid
      const payerId = expense.paidBy?._id || expense.paidBy;
      if (payerId && balances[payerId]) {
        balances[payerId].paid += totalAmount;
      }
    } else if (expense.splitType === 'unequal') {
      // Unequal split: use participants data
      const participants = expense.participants || [];
      
      participants.forEach((participant: any) => {
        const userId = participant?.user?._id || participant?.user;
        if (userId && balances[userId]) {
          const paid = participant.amountPaid || 0;
          const share = participant.share || 0;
          balances[userId].paid += paid;
          balances[userId].share += share;
        }
      });
    }
  });

  // Calculate final balances (positive = gets back, negative = owes)
  Object.keys(balances).forEach(userId => {
    balances[userId].balance = balances[userId].paid - balances[userId].share;
  });

  return balances;
}

export function calculateWhoOwesWhom(balances: { [key: string]: { paid: number; share: number; balance: number } }) {
  const debtors: Array<{ userId: string; amount: number }> = [];
  const creditors: Array<{ userId: string; amount: number }> = [];
  
  // Separate debtors (negative balance) and creditors (positive balance)
  for (const [userId, data] of Object.entries(balances)) {
    if (data.balance < -0.01) {
      debtors.push({ userId, amount: -data.balance });
    } else if (data.balance > 0.01) {
      creditors.push({ userId, amount: data.balance });
    }
  }
  
  // Sort by amount (largest first)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  
  // Calculate settlements
  const settlements: Array<{ from: string; to: string; amount: number }> = [];
  let i = 0;
  let j = 0;
  
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);
    
    if (amount > 0.01) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(amount * 100) / 100,
      });
    }
    
    debtor.amount -= amount;
    creditor.amount -= amount;
    
    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }
  
  return settlements;
}