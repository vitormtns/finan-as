import type { PaymentMethod } from "@prisma/client";

export type FixedExpenseFormOptions = {
  categories: {
    id: string;
    name: string;
    color: string | null;
  }[];
  cards: {
    id: string;
    name: string;
    color: string | null;
  }[];
};

export type EditableFixedExpense = {
  id: string;
  description: string;
  amount: string;
  dueDay: number;
  categoryId: string;
  paymentMethod: PaymentMethod;
  cardId: string;
  active: boolean;
};

export type FixedExpenseListItem = {
  id: string;
  description: string;
  amount: number;
  dueDay: number;
  paymentMethod: PaymentMethod;
  active: boolean;
  categoryName: string;
  categoryColor: string | null;
  cardName: string | null;
  status: "pending" | "paid" | "overdue" | "inactive";
  paidAt: string | null;
  paymentTransactionId: string | null;
  latestPaidAt: string | null;
};

export type FixedExpensesSummary = {
  activeMonthlyTotal: number;
  pendingTotal: number;
  overdueTotal: number;
  paidTotal: number;
  pendingCount: number;
  overdueCount: number;
  paidCount: number;
};

export type FixedExpensesPageData = {
  options: FixedExpenseFormOptions;
  expenses: FixedExpenseListItem[];
  summary: FixedExpensesSummary;
};
