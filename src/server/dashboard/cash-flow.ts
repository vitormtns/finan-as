export type MonthlyCashFlowInput = {
  totalIncome: number;
  paidExpensesTotal: number;
  remainingFixedExpensesTotal: number;
  cardInvoicesTotal: number;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateMonthlyCashFlow(input: MonthlyCashFlowInput) {
  const balanceAfterExpenses = roundMoney(
    input.totalIncome - input.paidExpensesTotal,
  );
  const outstandingBillsTotal = roundMoney(
    input.remainingFixedExpensesTotal + input.cardInvoicesTotal,
  );
  const totalCommitted = roundMoney(
    input.paidExpensesTotal + outstandingBillsTotal,
  );
  const balanceAfterCommitments = roundMoney(
    input.totalIncome - totalCommitted,
  );

  return {
    balanceAfterExpenses,
    outstandingBillsTotal,
    totalCommitted,
    balanceAfterCommitments,
  };
}
