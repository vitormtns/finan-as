import { PaymentMethod, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listCardsWithCurrentMonthData(
  userId: string,
  month: number,
  year: number,
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return prisma.card.findMany({
    where: { userId },
    orderBy: { name: "asc" },
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
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          transactions: true,
          fixedExpenses: true,
        },
      },
    },
  });
}

export async function findCardForEdit(userId: string, id: string) {
  return prisma.card.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function createCard(data: Prisma.CardCreateInput) {
  return prisma.card.create({ data });
}

export async function updateCard(
  userId: string,
  id: string,
  data: Prisma.CardUpdateInput,
) {
  return prisma.card.update({
    where: {
      id,
      userId,
    },
    data,
  });
}

export async function countCardLinks(userId: string, id: string) {
  const [transactions, fixedExpenses] = await Promise.all([
    prisma.transaction.count({
      where: {
        userId,
        cardId: id,
      },
    }),
    prisma.fixedExpense.count({
      where: {
        userId,
        cardId: id,
      },
    }),
  ]);

  return transactions + fixedExpenses;
}

export async function deleteCard(userId: string, id: string) {
  return prisma.card.delete({
    where: {
      id,
      userId,
    },
  });
}
