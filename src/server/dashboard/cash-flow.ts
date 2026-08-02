export type MonthlyCashFlowInput = {
  totalIncome: number;
  totalExpenses: number;
  remainingFixedExpensesTotal: number;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateMonthlyCashFlow(input: MonthlyCashFlowInput) {
  const balanceAfterExpenses = roundMoney(
    input.totalIncome - input.totalExpenses,
  );
  const totalCommitted = roundMoney(
    input.totalExpenses + input.remainingFixedExpensesTotal,
  );
  const balanceAfterCommitments = roundMoney(
    input.totalIncome - totalCommitted,
  );

  return {
    balanceAfterExpenses,
    totalCommitted,
    balanceAfterCommitments,
  };
}
