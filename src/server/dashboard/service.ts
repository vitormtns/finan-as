import { TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/formatters";
import type {
  DashboardCategory,
  DashboardOrientation,
  MonthlyDashboard,
  RemainingFixedExpense,
} from "./types";

function getCurrentMonthReference(date = new Date()) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const currentDay = date.getDate();
  const daysInMonth = new Date(year, month, 0).getDate();

  return {
    month,
    year,
    currentDay,
    daysInMonth,
    remainingDays: Math.max(daysInMonth - currentDay + 1, 1),
    startDate: new Date(year, month - 1, 1),
    endDate: new Date(year, month, 1),
  };
}

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

function createOrientation(params: {
  budgetLimit: number | null;
  availableAmount: number | null;
  safeDailyLimit: number | null;
  projectedBudgetDifference: number | null;
  totalExpenses: number;
}): DashboardOrientation {
  const {
    budgetLimit,
    availableAmount,
    safeDailyLimit,
    projectedBudgetDifference,
    totalExpenses,
  } = params;

  if (budgetLimit === null) {
    return {
      status: "Meta pendente",
      title: "Configure sua meta mensal",
      description:
        "Cadastre uma meta para acompanhar o valor disponível, o limite seguro por dia e a projeção do mês.",
      tone: "info",
    };
  }

  if (totalExpenses === 0) {
    return {
      status: "Tudo pronto",
      title: "Nenhum gasto registrado neste mês",
      description:
        "Quando você lançar seus gastos, o painel calcula o ritmo do mês automaticamente.",
      tone: "success",
    };
  }

  if (availableAmount !== null && availableAmount < 0) {
    return {
      status: "Meta ultrapassada",
      title: "Você passou da meta mensal",
      description: `O mês já está ${formatCurrency(Math.abs(availableAmount))} acima da meta. Vale revisar os próximos gastos.`,
      tone: "danger",
    };
  }

  if (projectedBudgetDifference !== null && projectedBudgetDifference > 0) {
    return {
      status: "Atenção",
      title: "Seu ritmo pode passar da meta",
      description: `Nesse ritmo, você pode fechar o mês ${formatCurrency(projectedBudgetDifference)} acima da meta.`,
      tone: "warning",
    };
  }

  if (safeDailyLimit !== null && safeDailyLimit > 0) {
    return {
      status: "Dentro da meta",
      title: "Você está dentro da meta",
      description: `Seu limite seguro é de ${formatCurrency(safeDailyLimit)} por dia até o fim do mês.`,
      tone: "success",
    };
  }

  return {
    status: "Boa margem",
    title: "Você está indo bem",
    description:
      "Ainda há uma boa margem para o restante do mês. Continue acompanhando os próximos lançamentos.",
    tone: "success",
  };
}

export async function getMonthlyDashboard(
  userId: string,
  date = new Date(),
): Promise<MonthlyDashboard> {
  const reference = getCurrentMonthReference(date);

  const [transactions, budget, fixedExpenses] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: reference.startDate,
          lt: reference.endDate,
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
    }),
    prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month: reference.month,
          year: reference.year,
        },
      },
      select: {
        totalLimit: true,
      },
    }),
    prisma.fixedExpense.findMany({
      where: {
        userId,
        active: true,
        dueDay: {
          gte: reference.currentDay,
        },
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
    }),
  ]);

  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === TransactionType.EXPENSE,
  );
  const incomeTransactions = transactions.filter(
    (transaction) => transaction.type === TransactionType.INCOME,
  );

  const totalExpenses = roundMoney(
    expenseTransactions.reduce(
      (sum, transaction) => sum + decimalToNumber(transaction.amount),
      0,
    ),
  );
  const totalIncome = roundMoney(
    incomeTransactions.reduce(
      (sum, transaction) => sum + decimalToNumber(transaction.amount),
      0,
    ),
  );
  const budgetLimit = budget ? decimalToNumber(budget.totalLimit) : null;
  const availableAmount =
    budgetLimit === null ? null : roundMoney(budgetLimit - totalExpenses);
  const safeDailyLimit =
    availableAmount === null
      ? null
      : roundMoney(Math.max(availableAmount, 0) / reference.remainingDays);

  const categoryMap = new Map<
    string,
    { id: string; name: string; amount: number; color: string | null }
  >();

  for (const transaction of expenseTransactions) {
    const key = transaction.category?.id ?? "sem-categoria";
    const current = categoryMap.get(key) ?? {
      id: key,
      name: transaction.category?.name ?? "Sem categoria",
      amount: 0,
      color: transaction.category?.color ?? null,
    };

    current.amount += decimalToNumber(transaction.amount);
    categoryMap.set(key, current);
  }

  const categoryExpenses: DashboardCategory[] = Array.from(categoryMap.values())
    .map((category) => ({
      ...category,
      amount: roundMoney(category.amount),
      percentage:
        totalExpenses > 0
          ? Math.round((category.amount / totalExpenses) * 100)
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const largestCategory = categoryExpenses[0] ?? null;

  const remainingFixedExpenses: RemainingFixedExpense[] = fixedExpenses.map(
    (fixedExpense) => ({
      id: fixedExpense.id,
      description: fixedExpense.description,
      amount: decimalToNumber(fixedExpense.amount),
      dueDay: fixedExpense.dueDay,
      categoryName: fixedExpense.category?.name ?? "Sem categoria",
    }),
  );
  const remainingFixedExpensesTotal = roundMoney(
    remainingFixedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
  );
  const dailyAverage = roundMoney(totalExpenses / reference.currentDay);
  const projectedMonthTotal = roundMoney(dailyAverage * reference.daysInMonth);
  const projectedBudgetDifference =
    budgetLimit === null ? null : roundMoney(projectedMonthTotal - budgetLimit);
  const orientation = createOrientation({
    budgetLimit,
    availableAmount,
    safeDailyLimit,
    projectedBudgetDifference,
    totalExpenses,
  });

  return {
    month: reference.month,
    year: reference.year,
    currentDay: reference.currentDay,
    daysInMonth: reference.daysInMonth,
    remainingDays: reference.remainingDays,
    totalExpenses,
    totalIncome,
    budgetLimit,
    availableAmount,
    safeDailyLimit,
    categoryExpenses,
    largestCategory,
    remainingFixedExpenses,
    remainingFixedExpensesTotal,
    dailyAverage,
    projectedMonthTotal,
    projectedBudgetDifference,
    orientation,
  };
}
