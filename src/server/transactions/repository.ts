import type { Prisma } from "@prisma/client";
import { TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  EditableTransaction,
  TransactionFormOptions,
  TransactionListItem,
} from "./types";

export async function ensureProfile(userId: string) {
  return prisma.profile.upsert({
    where: { userId },
    update: {},
    create: { userId, name: "Usuário de desenvolvimento" },
  });
}

export async function listTransactionFormOptions(
  userId: string,
): Promise<TransactionFormOptions> {
  const [categories, cards] = await Promise.all([
    prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: { id: true, name: true, type: true, color: true },
    }),
    prisma.card.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true },
    }),
  ]);

  return { categories, cards };
}

export async function findTransactionForEdit(
  userId: string,
  id: string,
): Promise<EditableTransaction | null> {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
    select: {
      id: true,
      amount: true,
      description: true,
      categoryId: true,
      cardId: true,
      type: true,
      paymentMethod: true,
      date: true,
      isInstallment: true,
      installmentNumber: true,
      totalInstallments: true,
    },
  });

  if (!transaction) {
    return null;
  }

  return {
    id: transaction.id,
    amount: transaction.amount.toString(),
    description: transaction.description ?? "",
    categoryId: transaction.categoryId ?? "",
    cardId: transaction.cardId ?? "",
    type: transaction.type,
    paymentMethod: transaction.paymentMethod,
    date: transaction.date.toISOString().slice(0, 10),
    isInstallment: transaction.isInstallment,
    installmentNumber: transaction.installmentNumber,
    totalInstallments: transaction.totalInstallments,
  };
}

export async function listTransactionsByMonth(
  userId: string,
  month: number,
  year: number,
): Promise<TransactionListItem[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      category: {
        select: { name: true, color: true },
      },
      card: {
        select: { name: true },
      },
    },
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    amount: Number(transaction.amount),
    description:
      transaction.description ||
      (transaction.type === TransactionType.EXPENSE ? "Gasto sem descrição" : "Receita sem descrição"),
    type: transaction.type,
    paymentMethod: transaction.paymentMethod,
    date: transaction.date.toISOString().slice(0, 10),
    categoryName: transaction.category?.name ?? "Sem categoria",
    categoryColor: transaction.category?.color ?? null,
    cardName: transaction.card?.name ?? null,
    isInstallment: transaction.isInstallment,
    installmentNumber: transaction.installmentNumber,
    totalInstallments: transaction.totalInstallments,
  }));
}

export async function createTransactions(data: Prisma.TransactionCreateManyInput[]) {
  return prisma.transaction.createMany({ data });
}

export async function updateTransaction(
  userId: string,
  id: string,
  data: Prisma.TransactionUpdateInput,
) {
  return prisma.transaction.update({
    where: { id, userId },
    data,
  });
}

export async function deleteTransaction(userId: string, id: string) {
  return prisma.transaction.delete({
    where: { id, userId },
  });
}

export async function categoryBelongsToUser(
  userId: string,
  categoryId: string,
  type?: TransactionType,
) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId, type },
    select: { id: true },
  });

  return Boolean(category);
}

export async function cardBelongsToUser(userId: string, cardId: string) {
  const card = await prisma.card.findFirst({
    where: { id: cardId, userId },
    select: { id: true },
  });

  return Boolean(card);
}
