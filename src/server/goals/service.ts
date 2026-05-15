import { getGoalsRawData, listExpenseCategoryIds } from "./repository";
import {
  deleteCategoryBudget,
  upsertBudget,
  upsertCategoryBudget,
} from "./repository";
import type { GoalsPageData } from "./types";
import type { GoalsFormInput } from "./validation";

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

export async function getGoalsPageData(
  userId: string,
  month: number,
  year: number,
): Promise<GoalsPageData> {
  const rawData = await getGoalsRawData(userId, month, year);
  const budgetByCategory = new Map(
    rawData.categoryBudgets.map((budget) => [
      budget.categoryId,
      decimalToNumber(budget.limitAmount),
    ]),
  );
  const spentByCategory = new Map<string, number>();

  for (const transaction of rawData.transactions) {
    if (!transaction.categoryId) {
      continue;
    }

    spentByCategory.set(
      transaction.categoryId,
      (spentByCategory.get(transaction.categoryId) ?? 0) +
        decimalToNumber(transaction.amount),
    );
  }

  const categories = rawData.categories.map((category) => {
    const limitAmount = budgetByCategory.get(category.id) ?? null;
    const spentAmount = roundMoney(spentByCategory.get(category.id) ?? 0);

    return {
      id: category.id,
      name: category.name,
      color: category.color,
      limitAmount,
      spentAmount,
      percentageUsed:
        limitAmount && limitAmount > 0
          ? Math.min(Math.round((spentAmount / limitAmount) * 100), 999)
          : null,
    };
  });
  const totalLimit = rawData.budget
    ? decimalToNumber(rawData.budget.totalLimit)
    : null;
  const totalCategoryLimits = roundMoney(
    categories.reduce(
      (sum, category) => sum + (category.limitAmount ?? 0),
      0,
    ),
  );

  return {
    month,
    year,
    totalLimit,
    totalCategoryLimits,
    difference:
      totalLimit === null ? null : roundMoney(totalLimit - totalCategoryLimits),
    categories,
  };
}

export async function saveGoals(userId: string, data: GoalsFormInput) {
  const expenseCategoryIds = await listExpenseCategoryIds(userId);

  await upsertBudget(userId, data.month, data.year, data.totalLimit);

  await Promise.all(
    data.categoryBudgets.map((categoryBudget) => {
      if (!expenseCategoryIds.has(categoryBudget.categoryId)) {
        throw new Error("Categoria inválida para este usuário.");
      }

      if (categoryBudget.limitAmount === null) {
        return deleteCategoryBudget(
          userId,
          categoryBudget.categoryId,
          data.month,
          data.year,
        );
      }

      return upsertCategoryBudget(
        userId,
        categoryBudget.categoryId,
        data.month,
        data.year,
        categoryBudget.limitAmount,
      );
    }),
  );
}
