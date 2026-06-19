import { getMonthlyDashboard } from "@/server/dashboard/service";
import type { MonthlyDashboard } from "@/server/dashboard/types";
import {
  getWeeklyExpenses,
  listCardLimitUsages,
  listCategoryBudgetUsages,
} from "./repository";
import { generateFinancialAlertRules } from "./rules";

export async function generateFinancialAlertsFromDashboard(
  userId: string,
  dashboard: MonthlyDashboard,
  date = new Date(),
) {
  const [categoryBudgetUsages, weeklyExpenses, cardLimitUsages] =
    await Promise.all([
      listCategoryBudgetUsages(userId, dashboard.month, dashboard.year),
      getWeeklyExpenses(userId, date),
      listCardLimitUsages(userId, dashboard.month, dashboard.year),
    ]);

  return generateFinancialAlertRules({
    currentDay: dashboard.currentDay,
    daysInMonth: dashboard.daysInMonth,
    dayOfWeek: date.getDay(),
    totalExpenses: dashboard.totalExpenses,
    budgetLimit: dashboard.budgetLimit,
    projectedMonthTotal: dashboard.projectedMonthTotal,
    projectedBudgetDifference: dashboard.projectedBudgetDifference,
    remainingFixedExpensesTotal: dashboard.remainingFixedExpensesTotal,
    overdueFixedExpensesTotal: dashboard.overdueFixedExpensesTotal,
    weeklyExpenses,
    categoryBudgetUsages,
    cardLimitUsages,
  });
}

export async function generateFinancialAlerts(userId: string, date = new Date()) {
  const dashboard = await getMonthlyDashboard(userId, date);

  return generateFinancialAlertsFromDashboard(userId, dashboard, date);
}
