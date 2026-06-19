import { ensureProfile } from "@/server/transactions/repository";
import {
  countCardLinks,
  createCard,
  deleteCard,
  findCardForEdit,
  findCardWithInvoiceData,
  listCardsWithInvoiceData,
  updateCard,
} from "./repository";
import {
  getInvoiceCycleForReferenceDate,
  getNextInvoiceCycle,
  groupFutureInstallmentsByMonth,
  sumInvoice,
  toDateKey,
  type CardInvoiceInputTransaction,
  type CardInvoiceSummary,
} from "./invoice";
import type {
  CardInvoiceView,
  CardListItem,
  CardsPageData,
  EditableCard,
} from "./types";
import type { CardFormInput } from "./validation";

function decimalToNumber(value: { toString: () => string } | number | null) {
  if (value === null) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value.toString());
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function getInvoiceFetchStartDate(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function toInvoiceTransaction(
  transaction: {
    id: string;
    amount: { toString: () => string };
    description: string | null;
    date: Date;
    installmentNumber: number | null;
    totalInstallments: number | null;
    category: { name: string } | null;
  },
): CardInvoiceInputTransaction {
  return {
    id: transaction.id,
    amount: decimalToNumber(transaction.amount),
    description: transaction.description ?? "Compra sem descrição",
    date: transaction.date,
    categoryName: transaction.category?.name ?? "Sem categoria",
    installmentNumber: transaction.installmentNumber,
    totalInstallments: transaction.totalInstallments,
  };
}

function toInvoiceView(invoice: CardInvoiceSummary): CardInvoiceView {
  return {
    total: invoice.total,
    periodStart: toDateKey(invoice.periodStart),
    periodEnd: toDateKey(invoice.periodEnd),
    closingDate: toDateKey(invoice.closingDate),
    dueDate: toDateKey(invoice.dueDate),
    purchaseCount: invoice.purchaseCount,
    installmentCount: invoice.installmentCount,
    purchases: invoice.purchases,
  };
}

function toCardListItem(
  card: Awaited<ReturnType<typeof listCardsWithInvoiceData>>[number],
  date = new Date(),
): CardListItem {
  const closingDay = card.closingDay ?? 1;
  const dueDay = card.dueDay ?? 10;
  const transactions = card.transactions.map(toInvoiceTransaction);
  const currentCycle = getInvoiceCycleForReferenceDate({
    referenceDate: date,
    closingDay,
    dueDay,
  });
  const nextCycle = getNextInvoiceCycle({
    cycle: currentCycle,
    closingDay,
    dueDay,
  });
  const currentInvoice = sumInvoice(transactions, currentCycle);
  const nextInvoice = sumInvoice(transactions, nextCycle);
  const limitAmount = card.limitAmount ? decimalToNumber(card.limitAmount) : null;
  const availableLimit =
    limitAmount === null ? null : roundMoney(limitAmount - currentInvoice.total);
  const usedPercentage =
    limitAmount === null || limitAmount === 0
      ? null
      : Math.min(Math.round((currentInvoice.total / limitAmount) * 100), 999);

  return {
    id: card.id,
    name: card.name,
    color: card.color,
    limitAmount,
    closingDay: card.closingDay,
    dueDay: card.dueDay,
    currentInvoiceTotal: currentInvoice.total,
    nextInvoiceTotal: nextInvoice.total,
    usedPercentage,
    availableLimit,
    limitAlert: usedPercentage !== null && usedPercentage >= 80,
    linkedItemsCount: card._count.transactions + card._count.fixedExpenses,
    currentInvoice: toInvoiceView(currentInvoice),
    nextInvoice: toInvoiceView(nextInvoice),
    futureInstallments: groupFutureInstallmentsByMonth({
      transactions,
      afterCycle: currentCycle,
    }),
  };
}

export async function getCardsPageData(
  userId: string,
  selectedCardId?: string,
  date = new Date(),
): Promise<CardsPageData> {
  const cards = (
    await listCardsWithInvoiceData(userId, getInvoiceFetchStartDate(date))
  ).map((card) => toCardListItem(card, date));
  const selectedCard =
    cards.find((card) => card.id === selectedCardId) ?? cards[0] ?? null;

  return { cards, selectedCard };
}

export async function getCardInvoiceDetail(
  userId: string,
  id: string,
  date = new Date(),
): Promise<CardListItem | null> {
  const card = await findCardWithInvoiceData(
    userId,
    id,
    getInvoiceFetchStartDate(date),
  );

  if (!card) {
    return null;
  }

  return toCardListItem(card, date);
}

export async function getEditableCard(
  userId: string,
  id: string,
): Promise<EditableCard | null> {
  const card = await findCardForEdit(userId, id);

  if (!card) {
    return null;
  }

  return {
    id: card.id,
    name: card.name,
    color: card.color ?? "#2563eb",
    limitAmount: card.limitAmount?.toString() ?? "",
    closingDay: card.closingDay ?? 1,
    dueDay: card.dueDay ?? 10,
  };
}

export async function saveCard(userId: string, data: CardFormInput) {
  await ensureProfile(userId);

  await createCard({
    profile: { connect: { userId } },
    name: data.name,
    color: data.color,
    limitAmount: data.limitAmount,
    closingDay: data.closingDay,
    dueDay: data.dueDay,
  });
}

export async function editCard(
  userId: string,
  id: string,
  data: CardFormInput,
) {
  await updateCard(userId, id, {
    name: data.name,
    color: data.color,
    limitAmount: data.limitAmount,
    closingDay: data.closingDay,
    dueDay: data.dueDay,
  });
}

export async function removeCard(userId: string, id: string) {
  const linkedItemsCount = await countCardLinks(userId, id);

  if (linkedItemsCount > 0) {
    throw new Error(
      "Não é possível excluir um cartão com transações ou gastos fixos vinculados.",
    );
  }

  await deleteCard(userId, id);
}
