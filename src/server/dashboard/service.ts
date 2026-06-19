import { TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/formatters";
import { getFutureFixedExpensesForMonth } from "@/server/fixed-expenses/service";
import type {
  DailySpendingAllowance,
  DashboardCategory,
  DashboardOrientation,
  MonthlyDashboard,
  WeeklySummary,
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

function getStartOfWeek(date: Date) {
  const startDate = new Date(date);
  const dayOfWeek = startDate.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - daysSinceMonday);

  return startDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createDailySpendingAllowance(params: {
  budgetLimit: number | null;
  availableRealAmount: number | null;
  safeDailyAmount: number | null;
  daysInMonth: number;
}): DailySpendingAllowance {
  const {
    budgetLimit,
    availableRealAmount,
    safeDailyAmount,
    daysInMonth,
  } = params;

  if (budgetLimit === null || availableRealAmount === null || safeDailyAmount === null) {
    return {
      availableRealAmount: null,
      safeDailyAmount: null,
      message:
        "Configure sua meta mensal para saber quanto pode gastar hoje com segurança.",
      tone: "info",
    };
  }

  if (availableRealAmount < 0) {
    return {
      availableRealAmount,
      safeDailyAmount,
      message:
        "Você já passou do limite planejado considerando os gastos fixos futuros.",
      tone: "danger",
    };
  }

  const healthyDailyReference = budgetLimit / daysInMonth;
  const isTight = safeDailyAmount <= healthyDailyReference * 0.5;

  if (isTight) {
    return {
      availableRealAmount,
      safeDailyAmount,
      message: `Seu limite seguro hoje está apertado: ${formatCurrency(safeDailyAmount)}.`,
      tone: "warning",
    };
  }

  return {
    availableRealAmount,
    safeDailyAmount,
    message: `Você pode gastar até ${formatCurrency(safeDailyAmount)} hoje para manter o mês saudável.`,
    tone: "success",
  };
}

function createWeeklySummary(params: {
  currentWeekTransactions: {
    amount: { toString: () => string } | number;
    category: { id: string; name: string; color: string | null } | null;
  }[];
  previousWeekTransactions: {
    amount: { toString: () => string } | number;
  }[];
  elapsedDaysInWeek: number;
}): WeeklySummary {
  const {
    currentWeekTransactions,
    previousWeekTransactions,
    elapsedDaysInWeek,
  } = params;
  const totalExpenses = roundMoney(
    currentWeekTransactions.reduce(
      (sum, transaction) => sum + decimalToNumber(transaction.amount),
      0,
    ),
  );
  const previousWeekExpenses = roundMoney(
    previousWeekTransactions.reduce(
      (sum, transaction) => sum + decimalToNumber(transaction.amount),
      0,
    ),
  );
  const categoryMap = new Map<string, { name: string; amount: number }>();

  for (const transaction of currentWeekTransactions) {
    const key = transaction.category?.id ?? "sem-categoria";
    const current = categoryMap.get(key) ?? {
      name: transaction.category?.name ?? "Sem categoria",
      amount: 0,
    };

    current.amount += decimalToNumber(transaction.amount);
    categoryMap.set(key, current);
  }

  const topCategory = Array.from(categoryMap.values()).sort(
    (a, b) => b.amount - a.amount,
  )[0];
  const comparisonAmount =
    previousWeekExpenses > 0 ? roundMoney(totalExpenses - previousWeekExpenses) : null;
  const comparisonPercentage =
    previousWeekExpenses > 0 && comparisonAmount !== null
      ? Math.round((comparisonAmount / previousWeekExpenses) * 100)
      : null;

  return {
    totalExpenses,
    dailyAverage: roundMoney(totalExpenses / elapsedDaysInWeek),
    topCategoryName: topCategory?.name ?? null,
    topCategoryAmount: roundMoney(topCategory?.amount ?? 0),
    previousWeekExpenses,
    comparisonAmount,
    comparisonPercentage,
    comparisonTrend:
      comparisonAmount === null
        ? "none"
        : comparisonAmount > 0
          ? "up"
          : comparisonAmount < 0
            ? "down"
            : "same",
  };
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
  const currentWeekStartDate = getStartOfWeek(date);
  const currentWeekEndDate = addDays(date, 1);
  currentWeekEndDate.setHours(0, 0, 0, 0);
  const previousWeekStartDate = addDays(currentWeekStartDate, -7);
  const previousWeekEndDate = currentWeekStartDate;
  const currentWeekStartKey = toDateKey(currentWeekStartDate);
  const currentWeekEndKey = toDateKey(currentWeekEndDate);
  const previousWeekStartKey = toDateKey(previousWeekStartDate);
  const previousWeekEndKey = toDateKey(previousWeekEndDate);
  const elapsedDaysInWeek = Math.max(
    Math.ceil(
      (currentWeekEndDate.getTime() - currentWeekStartDate.getTime()) /
        86_400_000,
    ),
    1,
  );

  const [
    transactions,
    budget,
    futureFixedExpenses,
    weeklyTransactions,
  ] = await Promise.all([
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
    getFutureFixedExpensesForMonth(userId, date),
    prisma.transaction.findMany({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: {
          gte: previousWeekStartDate,
          lt: currentWeekEndDate,
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

  const remainingFixedExpenses = futureFixedExpenses.expenses;
  const remainingFixedExpensesTotal = futureFixedExpenses.total;
  const overdueFixedExpensesTotal = futureFixedExpenses.overdueTotal;
  const availableRealAmount =
    budgetLimit === null
      ? null
      : roundMoney(
          budgetLimit - totalExpenses - remainingFixedExpensesTotal,
        );
  const realSafeDailyLimit =
    availableRealAmount === null
      ? null
      : roundMoney(Math.max(availableRealAmount, 0) / reference.remainingDays);
  const dailySpendingAllowance = createDailySpendingAllowance({
    budgetLimit,
    availableRealAmount,
    safeDailyAmount: realSafeDailyLimit,
    daysInMonth: reference.daysInMonth,
  });
  const currentWeekTransactions = weeklyTransactions.filter(
    (transaction) => {
      const dateKey = toDateKey(transaction.date);

      return dateKey >= currentWeekStartKey && dateKey < currentWeekEndKey;
    },
  );
  const previousWeekTransactions = weeklyTransactions.filter(
    (transaction) => {
      const dateKey = toDateKey(transaction.date);

      return dateKey >= previousWeekStartKey && dateKey < previousWeekEndKey;
    },
  );
  const weeklySummary = createWeeklySummary({
    currentWeekTransactions,
    previousWeekTransactions,
    elapsedDaysInWeek,
  });
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
    dailySpendingAllowance,
    categoryExpenses,
    largestCategory,
    remainingFixedExpenses,
    remainingFixedExpensesTotal,
    overdueFixedExpensesTotal,
    weeklySummary,
    dailyAverage,
    projectedMonthTotal,
    projectedBudgetDifference,
    orientation,
  };
}
