import { TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { paymentMethodLabels } from "@/server/transactions/labels";
import type {
  MonthlyReport,
  ReportBreakdownItem,
  TopExpenseItem,
} from "./types";

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

function getMonthRange(month: number, year: number) {
  return {
    startDate: new Date(year, month - 1, 1),
    endDate: new Date(year, month, 1),
  };
}

function getPreviousMonth(month: number, year: number) {
  if (month === 1) {
    return { month: 12, year: year - 1 };
  }

  return { month: month - 1, year };
}

function calculatePercentage(amount: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((amount / total) * 100);
}

export async function getMonthlyReport(
  userId: string,
  month: number,
  year: number,
): Promise<MonthlyReport> {
  const { startDate, endDate } = getMonthRange(month, year);
  const previousMonth = getPreviousMonth(month, year);
  const previousRange = getMonthRange(previousMonth.month, previousMonth.year);

  const [transactions, previousExpensesAggregate] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: [{ amount: "desc" }, { date: "desc" }],
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: {
          gte: previousRange.startDate,
          lt: previousRange.endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const expenses = transactions.filter(
    (transaction) => transaction.type === TransactionType.EXPENSE,
  );
  const income = transactions.filter(
    (transaction) => transaction.type === TransactionType.INCOME,
  );
  const totalExpenses = roundMoney(
    expenses.reduce(
      (sum, transaction) => sum + decimalToNumber(transaction.amount),
      0,
    ),
  );
  const totalIncome = roundMoney(
    income.reduce(
      (sum, transaction) => sum + decimalToNumber(transaction.amount),
      0,
    ),
  );
  const balance = roundMoney(totalIncome - totalExpenses);

  const categoryMap = new Map<
    string,
    { label: string; amount: number; color: string | null }
  >();
  const paymentMethodMap = new Map<string, { label: string; amount: number }>();

  for (const transaction of expenses) {
    const amount = decimalToNumber(transaction.amount);
    const categoryKey = transaction.category?.id ?? "sem-categoria";
    const category = categoryMap.get(categoryKey) ?? {
      label: transaction.category?.name ?? "Sem categoria",
      amount: 0,
      color: transaction.category?.color ?? null,
    };
    category.amount += amount;
    categoryMap.set(categoryKey, category);

    const paymentKey = transaction.paymentMethod;
    const paymentMethod = paymentMethodMap.get(paymentKey) ?? {
      label: paymentMethodLabels[transaction.paymentMethod],
      amount: 0,
    };
    paymentMethod.amount += amount;
    paymentMethodMap.set(paymentKey, paymentMethod);
  }

  const categoryBreakdown: ReportBreakdownItem[] = Array.from(
    categoryMap.entries(),
  )
    .map(([key, item]) => ({
      key,
      label: item.label,
      amount: roundMoney(item.amount),
      percentage: calculatePercentage(item.amount, totalExpenses),
      color: item.color,
    }))
    .sort((a, b) => b.amount - a.amount);

  const paymentMethodBreakdown = Array.from(paymentMethodMap.entries())
    .map(([key, item]) => ({
      key,
      paymentMethod: key as keyof typeof paymentMethodLabels,
      label: item.label,
      amount: roundMoney(item.amount),
      percentage: calculatePercentage(item.amount, totalExpenses),
      color: null,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topExpenses: TopExpenseItem[] = expenses
    .slice()
    .sort((a, b) => decimalToNumber(b.amount) - decimalToNumber(a.amount))
    .slice(0, 5)
    .map((transaction) => ({
      id: transaction.id,
      description: transaction.description ?? "Gasto sem descrição",
      amount: decimalToNumber(transaction.amount),
      date: transaction.date.toISOString().slice(0, 10),
      categoryName: transaction.category?.name ?? "Sem categoria",
    }));

  const previousMonthExpenses = roundMoney(
    decimalToNumber(previousExpensesAggregate._sum.amount),
  );
  const differenceAmount = roundMoney(totalExpenses - previousMonthExpenses);
  const differencePercentage =
    previousMonthExpenses > 0
      ? Math.round((differenceAmount / previousMonthExpenses) * 100)
      : null;

  return {
    month,
    year,
    totalExpenses,
    totalIncome,
    balance,
    categoryBreakdown,
    paymentMethodBreakdown,
    comparison: {
      previousMonthExpenses,
      differenceAmount,
      differencePercentage,
      trend:
        differenceAmount > 0 ? "up" : differenceAmount < 0 ? "down" : "same",
    },
    topExpenses,
    hasData: transactions.length > 0,
  };
}
