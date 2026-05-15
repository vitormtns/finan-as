import { PaymentMethod, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listCategoryBudgetUsages(
  userId: string,
  month: number,
  year: number,
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  const [categoryBudgets, transactions] = await Promise.all([
    prisma.categoryBudget.findMany({
      where: {
        userId,
        month,
        year,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
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
  const spentByCategory = new Map<string, number>();

  for (const transaction of transactions) {
    if (!transaction.categoryId) {
      continue;
    }

    spentByCategory.set(
      transaction.categoryId,
      (spentByCategory.get(transaction.categoryId) ?? 0) +
        Number(transaction.amount),
    );
  }

  return categoryBudgets.map((budget) => ({
    categoryId: budget.categoryId,
    categoryName: budget.category.name,
    spentAmount: spentByCategory.get(budget.categoryId) ?? 0,
    limitAmount: Number(budget.limitAmount),
  }));
}

export async function getWeeklyExpenses(
  userId: string,
  date = new Date(),
) {
  const dayOfWeek = date.getDay();
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(date.getDate() - dayOfWeek);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const aggregate = await prisma.transaction.aggregate({
    where: {
      userId,
      type: TransactionType.EXPENSE,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return Number(aggregate._sum.amount ?? 0);
}

export async function listCardLimitUsages(
  userId: string,
  month: number,
  year: number,
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);
  const cards = await prisma.card.findMany({
    where: {
      userId,
      limitAmount: {
        not: null,
      },
    },
    include: {
      transactions: {
        where: {
          userId,
          paymentMethod: PaymentMethod.CREDIT,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
        select: {
          amount: true,
        },
      },
    },
  });

  return cards
    .filter((card) => card.limitAmount !== null)
    .map((card) => ({
      cardId: card.id,
      cardName: card.name,
      usedAmount: card.transactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        0,
      ),
      limitAmount: Number(card.limitAmount),
    }));
}
