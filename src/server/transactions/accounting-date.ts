import { PaymentMethod } from "@prisma/client";
import { getInvoiceCycleForTransaction } from "@/server/cards/invoice";

export type TransactionWithAccountingData = {
  date: Date;
  paymentMethod: PaymentMethod;
  card: {
    closingDay: number | null;
    dueDay: number | null;
  } | null;
};

export function getTransactionAccountingDate(
  transaction: TransactionWithAccountingData,
) {
  if (
    transaction.paymentMethod !== PaymentMethod.CREDIT ||
    !transaction.card
  ) {
    return transaction.date;
  }

  return getInvoiceCycleForTransaction({
    transactionDate: transaction.date,
    closingDay: transaction.card.closingDay ?? 1,
    dueDay: transaction.card.dueDay ?? 10,
  }).dueDate;
}

export function isTransactionInAccountingPeriod(
  transaction: TransactionWithAccountingData,
  startDate: Date,
  endDate: Date,
) {
  const accountingDate = getTransactionAccountingDate(transaction);

  return accountingDate >= startDate && accountingDate < endDate;
}

export function getAccountingQueryStart(startDate: Date) {
  const queryStart = new Date(startDate);
  queryStart.setDate(queryStart.getDate() - 40);

  return queryStart;
}
