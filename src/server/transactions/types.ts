import type { PaymentMethod, TransactionType } from "@prisma/client";

export type TransactionFormOptions = {
  categories: {
    id: string;
    name: string;
    type: TransactionType;
    color: string | null;
  }[];
  cards: {
    id: string;
    name: string;
    color: string | null;
  }[];
};

export type EditableTransaction = {
  id: string;
  amount: string;
  description: string;
  categoryId: string;
  cardId: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  date: string;
  isInstallment: boolean;
  installmentNumber: number | null;
  totalInstallments: number | null;
};

export type TransactionListItem = {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  date: string;
  categoryName: string;
  categoryColor: string | null;
  cardName: string | null;
  isInstallment: boolean;
  installmentNumber: number | null;
  totalInstallments: number | null;
};
