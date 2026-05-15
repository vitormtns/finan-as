import { PaymentMethod, TransactionType } from "@prisma/client";

export const transactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.EXPENSE]: "Despesa",
  [TransactionType.INCOME]: "Receita",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.PIX]: "Pix",
  [PaymentMethod.DEBIT]: "Débito",
  [PaymentMethod.CREDIT]: "Crédito",
  [PaymentMethod.CASH]: "Dinheiro",
  [PaymentMethod.BANK_SLIP]: "Boleto",
  [PaymentMethod.OTHER]: "Outro",
};
