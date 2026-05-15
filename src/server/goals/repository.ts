import { TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureProfile } from "@/server/transactions/repository";

export async function getGoalsRawData(
  userId: string,
  month: number,
  year: number,
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const [budget, categoryBudgets, categories, transactions] =
    await Promise.all([
      prisma.budget.findUnique({
        where: {
          userId_month_year: {
            userId,
            month,
            year,
          },
        },
      }),
      prisma.categoryBudget.findMany({
        where: {
          userId,
          month,
          year,
        },
      }),
      prisma.category.findMany({
        where: {
          userId,
          type: TransactionType.EXPENSE,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: {
          categoryId: true,
          amount: true,
        },
      }),
    ]);

  return { budget, categoryBudgets, categories, transactions };
}

export async function upsertBudget(
  userId: string,
  month: number,
  year: number,
  totalLimit: number,
) {
  await ensureProfile(userId);

  return prisma.budget.upsert({
    where: {
      userId_month_year: {
        userId,
        month,
        year,
      },
    },
    update: {
      totalLimit,
    },
    create: {
      userId,
      month,
      year,
      totalLimit,
    },
  });
}

export async function upsertCategoryBudget(
  userId: string,
  categoryId: string,
  month: number,
  year: number,
  limitAmount: number,
) {
  await ensureProfile(userId);

  return prisma.categoryBudget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId,
        month,
        year,
      },
    },
    update: {
      limitAmount,
    },
    create: {
      userId,
      categoryId,
      month,
      year,
      limitAmount,
    },
  });
}

export async function deleteCategoryBudget(
  userId: string,
  categoryId: string,
  month: number,
  year: number,
) {
  return prisma.categoryBudget.deleteMany({
    where: {
      userId,
      categoryId,
      month,
      year,
    },
  });
}

export async function listExpenseCategoryIds(userId: string) {
  const categories = await prisma.category.findMany({
    where: {
      userId,
      type: TransactionType.EXPENSE,
    },
    select: {
      id: true,
    },
  });

  return new Set(categories.map((category) => category.id));
}
