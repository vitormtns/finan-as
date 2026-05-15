import { TransactionType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listFixedExpenseFormOptions(userId: string) {
  const [categories, cards] = await Promise.all([
    prisma.category.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
      },
    }),
    prisma.card.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
      },
    }),
  ]);

  return { categories, cards };
}

export async function listFixedExpenses(userId: string) {
  return prisma.fixedExpense.findMany({
    where: { userId },
    include: {
      category: {
        select: {
          name: true,
          color: true,
        },
      },
      card: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [{ active: "desc" }, { dueDay: "asc" }, { description: "asc" }],
  });
}

export async function findFixedExpenseForEdit(userId: string, id: string) {
  return prisma.fixedExpense.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function createFixedExpense(data: Prisma.FixedExpenseCreateInput) {
  return prisma.fixedExpense.create({ data });
}

export async function updateFixedExpense(
  userId: string,
  id: string,
  data: Prisma.FixedExpenseUpdateInput,
) {
  return prisma.fixedExpense.update({
    where: {
      id,
      userId,
    },
    data,
  });
}

export async function deleteFixedExpense(userId: string, id: string) {
  return prisma.fixedExpense.delete({
    where: {
      id,
      userId,
    },
  });
}

export async function toggleFixedExpense(
  userId: string,
  id: string,
  active: boolean,
) {
  return prisma.fixedExpense.update({
    where: {
      id,
      userId,
    },
    data: {
      active,
    },
  });
}
