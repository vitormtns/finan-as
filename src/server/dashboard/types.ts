export type DashboardCategory = {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string | null;
};

export type RemainingFixedExpense = {
  id: string;
  description: string;
  amount: number;
  dueDay: number;
  categoryName: string;
};

export type DashboardOrientation = {
  status: string;
  title: string;
  description: string;
  tone: "info" | "success" | "warning" | "danger";
};

export type MonthlyDashboard = {
  month: number;
  year: number;
  currentDay: number;
  daysInMonth: number;
  remainingDays: number;
  totalExpenses: number;
  totalIncome: number;
  budgetLimit: number | null;
  availableAmount: number | null;
  safeDailyLimit: number | null;
  categoryExpenses: DashboardCategory[];
  largestCategory: DashboardCategory | null;
  remainingFixedExpenses: RemainingFixedExpense[];
  remainingFixedExpensesTotal: number;
  dailyAverage: number;
  projectedMonthTotal: number;
  projectedBudgetDifference: number | null;
  orientation: DashboardOrientation;
};
