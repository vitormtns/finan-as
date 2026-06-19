import test from "node:test";
import assert from "node:assert/strict";
import { generateFinancialAlertRules } from "./rules";
import type { AlertRuleInput } from "./types";

const baseInput: AlertRuleInput = {
  currentDay: 10,
  daysInMonth: 30,
  dayOfWeek: 2,
  totalExpenses: 900,
  budgetLimit: 3000,
  projectedMonthTotal: 2700,
  projectedBudgetDifference: -300,
  remainingFixedExpensesTotal: 0,
  overdueFixedExpensesTotal: 0,
  weeklyExpenses: 300,
  categoryBudgetUsages: [],
  cardLimitUsages: [],
};

test("gera alerta de ritmo quando a projeção passa da meta", () => {
  const alerts = generateFinancialAlertRules({
    ...baseInput,
    projectedMonthTotal: 3400,
    projectedBudgetDifference: 400,
  });

  assert.equal(alerts[0].type, "monthly_pace");
  assert.equal(alerts[0].severity, "warning");
});

test("gera alerta positivo quando o gasto está abaixo da meta proporcional", () => {
  const alerts = generateFinancialAlertRules({
    ...baseInput,
    totalExpenses: 500,
    projectedMonthTotal: 1500,
    projectedBudgetDifference: -1500,
  });

  assert.equal(alerts.some((alert) => alert.type === "positive_pace"), true);
});

test("gera estouro de categoria acima de 100%", () => {
  const alerts = generateFinancialAlertRules({
    ...baseInput,
    categoryBudgetUsages: [
      {
        categoryId: "lazer",
        categoryName: "Lazer",
        spentAmount: 520,
        limitAmount: 500,
      },
    ],
  });

  assert.equal(
    alerts.some((alert) => alert.type === "category_over_limit"),
    true,
  );
});

test("gera alerta de cartão acima de 80% do limite", () => {
  const alerts = generateFinancialAlertRules({
    ...baseInput,
    cardLimitUsages: [
      {
        cardId: "card",
        cardName: "Nubank",
        usedAmount: 840,
        limitAmount: 1000,
      },
    ],
  });

  assert.equal(alerts.some((alert) => alert.type === "card_limit_usage"), true);
});

test("gera alerta para gastos fixos vencidos ainda não pagos", () => {
  const alerts = generateFinancialAlertRules({
    ...baseInput,
    remainingFixedExpensesTotal: 250,
    overdueFixedExpensesTotal: 250,
  });

  assert.equal(
    alerts.some((alert) => alert.type === "overdue_fixed_expenses"),
    true,
  );
});
