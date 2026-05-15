import { ensureProfile } from "@/server/transactions/repository";
import {
  countCardLinks,
  createCard,
  deleteCard,
  findCardForEdit,
  listCardsWithCurrentMonthData,
  updateCard,
} from "./repository";
import type {
  CardInvoiceTransaction,
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

function getCurrentMonthReference(date = new Date()) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return { month, year };
}

function toInvoiceTransaction(
  transaction: Awaited<ReturnType<typeof listCardsWithCurrentMonthData>>[number]["transactions"][number],
): CardInvoiceTransaction {
  return {
    id: transaction.id,
    amount: decimalToNumber(transaction.amount),
    description: transaction.description ?? "Compra sem descrição",
    date: transaction.date.toISOString().slice(0, 10),
    categoryName: transaction.category?.name ?? "Sem categoria",
    installmentLabel:
      transaction.installmentNumber && transaction.totalInstallments
        ? `${transaction.installmentNumber}/${transaction.totalInstallments}`
        : null,
  };
}

function toCardListItem(
  card: Awaited<ReturnType<typeof listCardsWithCurrentMonthData>>[number],
): CardListItem {
  const currentMonthTotal = roundMoney(
    card.transactions.reduce(
      (sum, transaction) => sum + decimalToNumber(transaction.amount),
      0,
    ),
  );
  const limitAmount = card.limitAmount ? decimalToNumber(card.limitAmount) : null;
  const availableLimit =
    limitAmount === null ? null : roundMoney(limitAmount - currentMonthTotal);
  const usedPercentage =
    limitAmount === null || limitAmount === 0
      ? null
      : Math.min(Math.round((currentMonthTotal / limitAmount) * 100), 999);

  return {
    id: card.id,
    name: card.name,
    color: card.color,
    limitAmount,
    closingDay: card.closingDay,
    dueDay: card.dueDay,
    currentMonthTotal,
    usedPercentage,
    availableLimit,
    linkedItemsCount: card._count.transactions + card._count.fixedExpenses,
    invoiceTransactions: card.transactions.map(toInvoiceTransaction),
  };
}

export async function getCardsPageData(
  userId: string,
  selectedCardId?: string,
  date = new Date(),
): Promise<CardsPageData> {
  const { month, year } = getCurrentMonthReference(date);
  const cards = (await listCardsWithCurrentMonthData(userId, month, year)).map(
    toCardListItem,
  );
  const selectedCard =
    cards.find((card) => card.id === selectedCardId) ?? cards[0] ?? null;

  return { cards, selectedCard };
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
