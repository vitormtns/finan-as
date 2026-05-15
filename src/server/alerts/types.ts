export type FinancialAlertSeverity = "info" | "warning" | "danger" | "success";

export type FinancialAlert = {
  type: string;
  title: string;
  message: string;
  severity: FinancialAlertSeverity;
  priority: number;
};

export type CategoryBudgetUsage = {
  categoryId: string;
  categoryName: string;
  spentAmount: number;
  limitAmount: number;
};

export type CardLimitUsage = {
  cardId: string;
  cardName: string;
  usedAmount: number;
  limitAmount: number;
};

export type AlertRuleInput = {
  currentDay: number;
  daysInMonth: number;
  dayOfWeek: number;
  totalExpenses: number;
  budgetLimit: number | null;
  projectedMonthTotal: number;
  projectedBudgetDifference: number | null;
  remainingFixedExpensesTotal: number;
  weeklyExpenses: number;
  categoryBudgetUsages: CategoryBudgetUsage[];
  cardLimitUsages: CardLimitUsage[];
};
