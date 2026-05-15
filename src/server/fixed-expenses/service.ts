import { PaymentMethod } from "@prisma/client";
import {
  cardBelongsToUser,
  categoryBelongsToUser,
  ensureProfile,
} from "@/server/transactions/repository";
import {
  createFixedExpense,
  deleteFixedExpense,
  findFixedExpenseForEdit,
  listFixedExpenseFormOptions,
  listFixedExpenses,
  toggleFixedExpense,
  updateFixedExpense,
} from "./repository";
import type {
  EditableFixedExpense,
  FixedExpenseListItem,
  FixedExpensesPageData,
} from "./types";
import type { FixedExpenseFormInput } from "./validation";

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

function getStatus(active: boolean, dueDay: number, currentDay: number) {
  if (!active) {
    return "inactive" as const;
  }

  return dueDay < currentDay ? ("overdue" as const) : ("upcoming" as const);
}

function toListItem(
  expense: Awaited<ReturnType<typeof listFixedExpenses>>[number],
  currentDay: number,
): FixedExpenseListItem {
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
    status: getStatus(expense.active, expense.dueDay, currentDay),
  };
}

export async function getFixedExpensesPageData(
  userId: string,
  date = new Date(),
): Promise<FixedExpensesPageData> {
  const currentDay = date.getDate();
  const [options, expenses] = await Promise.all([
    listFixedExpenseFormOptions(userId),
    listFixedExpenses(userId),
  ]);
  const items = expenses.map((expense) => toListItem(expense, currentDay));
  const activeExpenses = items.filter((expense) => expense.active);
  const upcomingExpenses = items.filter(
    (expense) => expense.status === "upcoming",
  );
  const overdueExpenses = items.filter(
    (expense) => expense.status === "overdue",
  );

  return {
    options,
    expenses: items,
    summary: {
      activeMonthlyTotal: roundMoney(
        activeExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      ),
      upcomingTotal: roundMoney(
        upcomingExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      ),
      overdueTotal: roundMoney(
        overdueExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      ),
      upcomingCount: upcomingExpenses.length,
      overdueCount: overdueExpenses.length,
    },
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
