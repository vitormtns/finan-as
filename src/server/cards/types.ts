import type { PaymentMethod } from "@prisma/client";
import type {
  CardInvoicePurchase,
  FutureInstallmentMonth,
} from "./invoice";

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

export type CardInvoiceView = {
  total: number;
  periodStart: string;
  periodEnd: string;
  closingDate: string;
  dueDate: string;
  purchaseCount: number;
  installmentCount: number;
  purchases: CardInvoicePurchase[];
};

export type CardListItem = {
  id: string;
  name: string;
  color: string | null;
  limitAmount: number | null;
  closingDay: number | null;
  dueDay: number | null;
  currentInvoiceTotal: number;
  nextInvoiceTotal: number;
  usedPercentage: number | null;
  availableLimit: number | null;
  limitAlert: boolean;
  linkedItemsCount: number;
  currentInvoice: CardInvoiceView;
  nextInvoice: CardInvoiceView;
  futureInstallments: FutureInstallmentMonth[];
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
