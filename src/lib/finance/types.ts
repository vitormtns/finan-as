export type TransactionType = "EXPENSE" | "INCOME";

export type PaymentMethod =
  | "PIX"
  | "DEBIT"
  | "CREDIT"
  | "CASH"
  | "BANK_SLIP"
  | "OTHER";

export type CategoryType = TransactionType;

export const TRANSACTION_TYPE = {
  EXPENSE: "EXPENSE",
  INCOME: "INCOME",
} as const satisfies Record<string, TransactionType>;

export const PAYMENT_METHOD = {
  PIX: "PIX",
  DEBIT: "DEBIT",
  CREDIT: "CREDIT",
  CASH: "CASH",
  BANK_SLIP: "BANK_SLIP",
  OTHER: "OTHER",
} as const satisfies Record<string, PaymentMethod>;

export const TRANSACTION_TYPE_OPTIONS = [
  { value: TRANSACTION_TYPE.EXPENSE, label: "Despesa" },
  { value: TRANSACTION_TYPE.INCOME, label: "Receita" },
] as const;

export const CATEGORY_TYPE_OPTIONS = TRANSACTION_TYPE_OPTIONS;

export const PAYMENT_METHOD_OPTIONS = [
  { value: PAYMENT_METHOD.PIX, label: "Pix" },
  { value: PAYMENT_METHOD.DEBIT, label: "Débito" },
  { value: PAYMENT_METHOD.CREDIT, label: "Crédito" },
  { value: PAYMENT_METHOD.CASH, label: "Dinheiro" },
  { value: PAYMENT_METHOD.BANK_SLIP, label: "Boleto" },
  { value: PAYMENT_METHOD.OTHER, label: "Outro" },
] as const;

export const transactionTypeLabels: Record<TransactionType, string> = {
  [TRANSACTION_TYPE.EXPENSE]: "Despesa",
  [TRANSACTION_TYPE.INCOME]: "Receita",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PAYMENT_METHOD.PIX]: "Pix",
  [PAYMENT_METHOD.DEBIT]: "Débito",
  [PAYMENT_METHOD.CREDIT]: "Crédito",
  [PAYMENT_METHOD.CASH]: "Dinheiro",
  [PAYMENT_METHOD.BANK_SLIP]: "Boleto",
  [PAYMENT_METHOD.OTHER]: "Outro",
};

export type CategoryFormCategory = {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
};

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
