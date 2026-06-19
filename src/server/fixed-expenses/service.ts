import { PaymentMethod, Prisma } from "@prisma/client";
import {
  cardBelongsToUser,
  categoryBelongsToUser,
  ensureProfile,
} from "@/server/transactions/repository";
import {
  createFixedExpensePaymentWithTransaction,
  createFixedExpense,
  deleteFixedExpense,
  findFixedExpenseForEdit,
  findFixedExpenseForPayment,
  findFixedExpensePaymentForMonth,
  findLatestFixedExpensePayments,
  listFutureActiveFixedExpenses,
  listFixedExpensePaymentsByMonth,
  listFixedExpenseFormOptions,
  listFixedExpenses,
  toggleFixedExpense,
  updateFixedExpense,
} from "./repository";
import {
  assertCanCreateMonthlyPayment,
  calculateMonthlyFixedExpenseStatus,
  getMonthReference,
  getOutstandingFixedExpensesForDashboard,
} from "./rules";
import type {
  EditableFixedExpense,
  FixedExpenseListItem,
  FixedExpensesPageData,
} from "./types";
import type { FixedExpenseFormInput } from "./validation";

export type FutureFixedExpense = {
  id: string;
  description: string;
  amount: number;
  dueDay: number;
  categoryName: string;
  status: "pending" | "overdue";
};

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

function toDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function validateRelations(userId: string, data: FixedExpenseFormInput) {
  if (data.categoryId) {
    const categoryExists = await categoryBelongsToUser(userId, data.categoryId);

    if (!categoryExists) {
      throw new Error("Categoria inválida para este usuário.");
    }
  }

  if (data.cardId && data.paymentMethod === PaymentMethod.CREDIT) {
    const cardExists = await cardBelongsToUser(userId, data.cardId);

    if (!cardExists) {
      throw new Error("Cartão inválido para este usuário.");
    }
  }
}

function toListItem(
  expense: Awaited<ReturnType<typeof listFixedExpenses>>[number],
  params: {
    month: number;
    year: number;
    currentDay: number;
    payments: Awaited<ReturnType<typeof listFixedExpensePaymentsByMonth>>;
    latestPayments: Awaited<ReturnType<typeof findLatestFixedExpensePayments>>;
  },
): FixedExpenseListItem {
  const payment = params.payments.find(
    (item) => item.fixedExpenseId === expense.id,
  );
  const latestPayment = params.latestPayments.find(
    (item) => item.fixedExpenseId === expense.id,
  );
  const status = calculateMonthlyFixedExpenseStatus({
    expense,
    payments: params.payments,
    month: params.month,
    year: params.year,
    currentDay: params.currentDay,
  });

  return {
    id: expense.id,
    description: expense.description,
    amount: decimalToNumber(expense.amount),
    dueDay: expense.dueDay,
    paymentMethod: expense.paymentMethod,
    active: expense.active,
    categoryName: expense.category?.name ?? "Sem categoria",
    categoryColor: expense.category?.color ?? null,
    cardName: expense.card?.name ?? null,
    status,
    paidAt: payment ? toDateInputValue(payment.paidAt) : null,
    paymentTransactionId: payment?.transactionId ?? null,
    latestPaidAt: latestPayment ? toDateInputValue(latestPayment.paidAt) : null,
  };
}

export async function getFixedExpensesPageData(
  userId: string,
  date = new Date(),
): Promise<FixedExpensesPageData> {
  const reference = getMonthReference(date);
  const [options, expenses, payments, latestPayments] = await Promise.all([
    listFixedExpenseFormOptions(userId),
    listFixedExpenses(userId),
    listFixedExpensePaymentsByMonth(userId, reference.month, reference.year),
    findLatestFixedExpensePayments(userId),
  ]);
  const items = expenses.map((expense) =>
    toListItem(expense, {
      ...reference,
      payments,
      latestPayments,
    }),
  );
  const activeExpenses = items.filter((expense) => expense.active);
  const pendingExpenses = items.filter(
    (expense) => expense.status === "pending",
  );
  const overdueExpenses = items.filter(
    (expense) => expense.status === "overdue",
  );
  const paidExpenses = items.filter((expense) => expense.status === "paid");

  return {
    options,
    expenses: items,
    summary: {
      activeMonthlyTotal: roundMoney(
        activeExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      ),
      pendingTotal: roundMoney(
        pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      ),
      overdueTotal: roundMoney(
        overdueExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      ),
      paidTotal: roundMoney(
        paidExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      ),
      pendingCount: pendingExpenses.length,
      overdueCount: overdueExpenses.length,
      paidCount: paidExpenses.length,
    },
  };
}

export async function getFutureFixedExpensesForMonth(
  userId: string,
  date = new Date(),
): Promise<{
  expenses: FutureFixedExpense[];
  total: number;
  overdueTotal: number;
}> {
  const reference = getMonthReference(date);
  const [fixedExpenses, payments] = await Promise.all([
    listFutureActiveFixedExpenses(userId),
    listFixedExpensePaymentsByMonth(userId, reference.month, reference.year),
  ]);
  const outstandingFixedExpenses = getOutstandingFixedExpensesForDashboard({
    expenses: fixedExpenses.map((fixedExpense) => ({
      id: fixedExpense.id,
      active: fixedExpense.active,
      dueDay: fixedExpense.dueDay,
      amount: decimalToNumber(fixedExpense.amount),
    })),
    payments,
    ...reference,
  });
  const outstandingIds = new Set(
    outstandingFixedExpenses.map((expense) => expense.id),
  );
  const expenses = fixedExpenses
    .filter((fixedExpense) => outstandingIds.has(fixedExpense.id))
    .map((fixedExpense) => ({
      id: fixedExpense.id,
      description: fixedExpense.description,
      amount: decimalToNumber(fixedExpense.amount),
      dueDay: fixedExpense.dueDay,
      categoryName: fixedExpense.category?.name ?? "Sem categoria",
      status:
        fixedExpense.dueDay < reference.currentDay
          ? ("overdue" as const)
          : ("pending" as const),
    }));

  return {
    expenses,
    total: roundMoney(
      expenses.reduce((sum, expense) => sum + expense.amount, 0),
    ),
    overdueTotal: roundMoney(
      expenses
        .filter((expense) => expense.status === "overdue")
        .reduce((sum, expense) => sum + expense.amount, 0),
    ),
  };
}

export async function getEditableFixedExpense(
  userId: string,
  id: string,
): Promise<EditableFixedExpense | null> {
  const expense = await findFixedExpenseForEdit(userId, id);

  if (!expense) {
    return null;
  }

  return {
    id: expense.id,
    description: expense.description,
    amount: expense.amount.toString(),
    dueDay: expense.dueDay,
    categoryId: expense.categoryId ?? "",
    paymentMethod: expense.paymentMethod,
    cardId: expense.cardId ?? "",
    active: expense.active,
  };
}

export async function saveFixedExpense(
  userId: string,
  data: FixedExpenseFormInput,
) {
  await ensureProfile(userId);
  await validateRelations(userId, data);

  const relationData = {
    category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
    card:
      data.paymentMethod === PaymentMethod.CREDIT && data.cardId
        ? { connect: { id: data.cardId } }
        : undefined,
  };

  await createFixedExpense({
    profile: { connect: { userId } },
    description: data.description,
    amount: data.amount,
    dueDay: data.dueDay,
    paymentMethod: data.paymentMethod,
    active: data.active,
    ...relationData,
  });
}

export async function editFixedExpense(
  userId: string,
  id: string,
  data: FixedExpenseFormInput,
) {
  await validateRelations(userId, data);

  await updateFixedExpense(userId, id, {
    description: data.description,
    amount: data.amount,
    dueDay: data.dueDay,
    paymentMethod: data.paymentMethod,
    active: data.active,
    category: data.categoryId
      ? { connect: { id: data.categoryId } }
      : { disconnect: true },
    card:
      data.paymentMethod === PaymentMethod.CREDIT && data.cardId
        ? { connect: { id: data.cardId } }
        : { disconnect: true },
  });
}

export async function removeFixedExpense(userId: string, id: string) {
  await deleteFixedExpense(userId, id);
}

export async function setFixedExpenseActive(
  userId: string,
  id: string,
  active: boolean,
) {
  await toggleFixedExpense(userId, id, active);
}

export async function launchFixedExpensePayment(
  userId: string,
  id: string,
  paidAt = new Date(),
) {
  await ensureProfile(userId);

  const paymentDate = toDateOnly(paidAt);
  const reference = getMonthReference(paymentDate);
  const [fixedExpense, existingPayment] = await Promise.all([
    findFixedExpenseForPayment(userId, id),
    findFixedExpensePaymentForMonth(
      userId,
      id,
      reference.month,
      reference.year,
    ),
  ]);

  if (!fixedExpense) {
    throw new Error("Gasto fixo ativo não encontrado.");
  }

  assertCanCreateMonthlyPayment({
    fixedExpenseId: id,
    month: reference.month,
    year: reference.year,
    payments: existingPayment
      ? [
          {
            fixedExpenseId: existingPayment.fixedExpenseId,
            month: existingPayment.month,
            year: existingPayment.year,
          },
        ]
      : [],
  });

  try {
    return await createFixedExpensePaymentWithTransaction({
      userId,
      fixedExpense,
      month: reference.month,
      year: reference.year,
      paidAt: paymentDate,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Este gasto fixo já foi pago neste mês.");
    }

    throw error;
  }
}
