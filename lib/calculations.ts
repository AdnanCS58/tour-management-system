export interface MemberBalance {
  paid: number;
  share: number;
  balance: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

function roundMoney(
  value: number
): number {
  return Math.round(
    (value + Number.EPSILON) * 100
  ) / 100;
}

export function formatCurrency(
  amount: number
): string {
  if (
    amount === undefined ||
    amount === null ||
    isNaN(amount)
  ) {
    return '৳0.00';
  }

  return `৳${roundMoney(amount).toFixed(
    2
  )}`;
}

/**
 * Calculate each member's:
 *
 * paid  = actual amount they paid
 * share = amount they are responsible for
 *
 * balance = paid - share
 *
 * Positive balance:
 *   Member should receive money.
 *
 * Negative balance:
 *   Member owes money.
 */
export function calculateBalances(
  expenses: any[],
  members: any[]
): {
  [key: string]: MemberBalance;
} {
  const balances: {
    [key: string]: MemberBalance;
  } = {};

  // --------------------------------------------------
  // Initialize all members
  // --------------------------------------------------

  members.forEach((member: any) => {
    const userId =
      member?.user?._id ||
      member?.user;

    if (userId) {
      const id = userId.toString();

      balances[id] = {
        paid: 0,
        share: 0,
        balance: 0,
      };
    }
  });

  // --------------------------------------------------
  // Process expenses
  // --------------------------------------------------

  expenses.forEach((expense: any) => {
    if (!expense) {
      return;
    }

    const participants =
      expense.participants || [];

    // ------------------------------------------------
    // New expense format
    // ------------------------------------------------

    participants.forEach(
      (participant: any) => {
        const userId =
          participant?.user?._id ||
          participant?.user;

        if (!userId) {
          return;
        }

        const id =
          userId.toString();

        if (!balances[id]) {
          return;
        }

        const paid =
          Number(
            participant.amountPaid
          ) || 0;

        const share =
          Number(
            participant.share
          ) || 0;

        balances[id].paid += paid;
        balances[id].share +=
          share;
      }
    );
  });

  // --------------------------------------------------
  // Calculate final balances
  // --------------------------------------------------

  Object.keys(balances).forEach(
    (userId) => {
      balances[userId].paid =
        roundMoney(
          balances[userId].paid
        );

      balances[userId].share =
        roundMoney(
          balances[userId].share
        );

      balances[userId].balance =
        roundMoney(
          balances[userId].paid -
            balances[userId].share
        );
    }
  );

  return balances;
}

/**
 * Convert balances into a simple settlement plan.
 *
 * Example:
 *
 * A: +1500
 * B: +500
 * C: -500
 * D: -500
 * E: -500
 * F: -500
 *
 * Returns transactions describing who should pay whom.
 */
export function calculateWhoOwesWhom(
  balances: {
    [key: string]: MemberBalance;
  }
): Settlement[] {
  const debtors: Array<{
    userId: string;
    amount: number;
  }> = [];

  const creditors: Array<{
    userId: string;
    amount: number;
  }> = [];

  // --------------------------------------------------
  // Separate debtors and creditors
  // --------------------------------------------------

  for (const [
    userId,
    data,
  ] of Object.entries(balances)) {
    const balance =
      roundMoney(data.balance);

    if (balance < -0.01) {
      debtors.push({
        userId,
        amount: roundMoney(
          Math.abs(balance)
        ),
      });
    } else if (balance > 0.01) {
      creditors.push({
        userId,
        amount: balance,
      });
    }
  }

  // Largest amount first
  debtors.sort(
    (a, b) =>
      b.amount - a.amount
  );

  creditors.sort(
    (a, b) =>
      b.amount - a.amount
  );

  const settlements: Settlement[] =
    [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  // --------------------------------------------------
  // Match debtors with creditors
  // --------------------------------------------------

  while (
    debtorIndex <
      debtors.length &&
    creditorIndex <
      creditors.length
  ) {
    const debtor =
      debtors[debtorIndex];

    const creditor =
      creditors[creditorIndex];

    const amount = roundMoney(
      Math.min(
        debtor.amount,
        creditor.amount
      )
    );

    if (amount > 0.01) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount,
      });
    }

    debtor.amount = roundMoney(
      debtor.amount - amount
    );

    creditor.amount = roundMoney(
      creditor.amount - amount
    );

    if (debtor.amount <= 0.01) {
      debtorIndex++;
    }

    if (creditor.amount <= 0.01) {
      creditorIndex++;
    }
  }

  return settlements;
}