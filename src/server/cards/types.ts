import type { PaymentMethod } from "@prisma/client";

export type EditableCard = {
  id: string;
  name: string;
  color: string;
  limitAmount: string;
  closingDay: number;
  dueDay: number;
};

export type CardInvoiceTransaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryName: string;
  installmentLabel: string | null;
};

export type CardListItem = {
  id: string;
  name: string;
  color: string | null;
  limitAmount: number | null;
  closingDay: number | null;
  dueDay: number | null;
  currentMonthTotal: number;
  usedPercentage: number | null;
  availableLimit: number | null;
  linkedItemsCount: number;
  invoiceTransactions: CardInvoiceTransaction[];
};

export type CardsPageData = {
  cards: CardListItem[];
  selectedCard: CardListItem | null;
};

export type CreditTransactionForInvoice = {
  id: string;
  amount: { toString: () => string };
  description: string | null;
  date: Date;
  installmentNumber: number | null;
  totalInstallments: number | null;
  category: {
    name: string;
  } | null;
  paymentMethod: PaymentMethod;
};
