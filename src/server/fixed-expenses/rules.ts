export type MonthlyFixedExpenseStatus = "pending" | "paid" | "overdue" | "inactive";

export type FixedExpenseStatusInput = {
  id: string;
  active: boolean;
  dueDay: number;
};

export type FixedExpensePaymentInput = {
  fixedExpenseId: string;
  month: number;
  year: number;
};

export type OutstandingFixedExpenseInput = FixedExpenseStatusInput & {
  amount: number;
};

export function getMonthReference(date = new Date()) {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    currentDay: date.getDate(),
  };
}

export function getFixedExpensePaymentKey(params: {
  userId: string;
  fixedExpenseId: string;
  month: number;
  year: number;
}) {
  return `${params.userId}:${params.fixedExpenseId}:${params.year}-${String(params.month).padStart(2, "0")}`;
}

export function hasMonthlyPayment(params: {
  fixedExpenseId: string;
  month: number;
  year: number;
  payments: FixedExpensePaymentInput[];
}) {
  return params.payments.some(
    (payment) =>
      payment.fixedExpenseId === params.fixedExpenseId &&
      payment.month === params.month &&
      payment.year === params.year,
  );
}

export function assertCanCreateMonthlyPayment(params: {
  fixedExpenseId: string;
  month: number;
  year: number;
  payments: FixedExpensePaymentInput[];
}) {
  if (hasMonthlyPayment(params)) {
    throw new Error("Este gasto fixo já foi pago neste mês.");
  }
}

export function calculateMonthlyFixedExpenseStatus(params: {
  expense: FixedExpenseStatusInput;
  payments: FixedExpensePaymentInput[];
  month: number;
  year: number;
  currentDay: number;
}): MonthlyFixedExpenseStatus {
  if (!params.expense.active) {
    return "inactive";
  }

  if (
    hasMonthlyPayment({
      fixedExpenseId: params.expense.id,
      month: params.month,
      year: params.year,
      payments: params.payments,
    })
  ) {
    return "paid";
  }

  return params.expense.dueDay < params.currentDay ? "overdue" : "pending";
}

export function getOutstandingFixedExpensesForDashboard(params: {
  expenses: OutstandingFixedExpenseInput[];
  payments: FixedExpensePaymentInput[];
  month: number;
  year: number;
  currentDay: number;
}) {
  return params.expenses.filter((expense) => {
    const status = calculateMonthlyFixedExpenseStatus({
      expense,
      payments: params.payments,
      month: params.month,
      year: params.year,
      currentDay: params.currentDay,
    });

    return status === "pending" || status === "overdue";
  });
}
