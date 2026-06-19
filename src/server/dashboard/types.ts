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
  status: "pending" | "overdue";
};

export type DashboardOrientation = {
  status: string;
  title: string;
  description: string;
  tone: "info" | "success" | "warning" | "danger";
};

export type DailySpendingAllowance = {
  availableRealAmount: number | null;
  safeDailyAmount: number | null;
  message: string;
  tone: "success" | "warning" | "danger" | "info";
};

export type WeeklySummary = {
  totalExpenses: number;
  dailyAverage: number;
  topCategoryName: string | null;
  topCategoryAmount: number;
  previousWeekExpenses: number;
  comparisonAmount: number | null;
  comparisonPercentage: number | null;
  comparisonTrend: "up" | "down" | "same" | "none";
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
  dailySpendingAllowance: DailySpendingAllowance;
  categoryExpenses: DashboardCategory[];
  largestCategory: DashboardCategory | null;
  remainingFixedExpenses: RemainingFixedExpense[];
  remainingFixedExpensesTotal: number;
  overdueFixedExpensesTotal: number;
  weeklySummary: WeeklySummary;
  dailyAverage: number;
  projectedMonthTotal: number;
  projectedBudgetDifference: number | null;
  orientation: DashboardOrientation;
};
