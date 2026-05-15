import type { PaymentMethod } from "@prisma/client";

export type ReportBreakdownItem = {
  key: string;
  label: string;
  amount: number;
  percentage: number;
  color: string | null;
};

export type TopExpenseItem = {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryName: string;
};

export type MonthComparison = {
  previousMonthExpenses: number;
  differenceAmount: number;
  differencePercentage: number | null;
  trend: "up" | "down" | "same";
};

export type MonthlyReport = {
  month: number;
  year: number;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  categoryBreakdown: ReportBreakdownItem[];
  paymentMethodBreakdown: (ReportBreakdownItem & {
    paymentMethod: PaymentMethod;
  })[];
  comparison: MonthComparison;
  topExpenses: TopExpenseItem[];
  hasData: boolean;
};
