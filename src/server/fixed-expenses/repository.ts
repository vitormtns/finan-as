import {
  FixedExpensePaymentStatus,
  TransactionType,
  type Prisma,
} from "@prisma/client";
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

export async function listFutureActiveFixedExpenses(
  userId: string,
) {
  return prisma.fixedExpense.findMany({
    where: {
      userId,
      active: true,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      dueDay: "asc",
    },
  });
}

export async function listFixedExpensePaymentsByMonth(
  userId: string,
  month: number,
  year: number,
) {
  return prisma.fixedExpensePayment.findMany({
    where: {
      userId,
      month,
      year,
    },
    include: {
      transaction: {
        select: {
          id: true,
          date: true,
        },
      },
    },
  });
}

export async function findLatestFixedExpensePayments(userId: string) {
  return prisma.fixedExpensePayment.findMany({
    where: { userId },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    distinct: ["fixedExpenseId"],
    select: {
      fixedExpenseId: true,
      paidAt: true,
      transactionId: true,
    },
  });
}

export async function findFixedExpenseForPayment(userId: string, id: string) {
  return prisma.fixedExpense.findFirst({
    where: {
      id,
      userId,
      active: true,
    },
  });
}

export async function findFixedExpensePaymentForMonth(
  userId: string,
  fixedExpenseId: string,
  month: number,
  year: number,
) {
  return prisma.fixedExpensePayment.findUnique({
    where: {
      userId_fixedExpenseId_month_year: {
        userId,
        fixedExpenseId,
        month,
        year,
      },
    },
  });
}

export async function createFixedExpensePaymentWithTransaction(params: {
  userId: string;
  fixedExpense: NonNullable<Awaited<ReturnType<typeof findFixedExpenseForPayment>>>;
  month: number;
  year: number;
  paidAt: Date;
}) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId: params.userId,
        categoryId: params.fixedExpense.categoryId,
        cardId:
          params.fixedExpense.paymentMethod === "CREDIT"
            ? params.fixedExpense.cardId
            : null,
        amount: params.fixedExpense.amount,
        description: params.fixedExpense.description,
        type: TransactionType.EXPENSE,
        paymentMethod: params.fixedExpense.paymentMethod,
        date: params.paidAt,
        isInstallment: false,
        installmentGroupId: null,
        installmentNumber: null,
        totalInstallments: null,
      },
    });

    const payment = await tx.fixedExpensePayment.create({
      data: {
        userId: params.userId,
        fixedExpenseId: params.fixedExpense.id,
        transactionId: transaction.id,
        month: params.month,
        year: params.year,
        paidAt: params.paidAt,
        status: FixedExpensePaymentStatus.PAID,
      },
    });

    return { transaction, payment };
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
