import { formatCurrency } from "@/lib/formatters";
import type { AlertRuleInput, FinancialAlert } from "./types";

function percentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function addAlert(alerts: FinancialAlert[], alert: FinancialAlert) {
  alerts.push(alert);
}

export function generateFinancialAlertRules(
  input: AlertRuleInput,
): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];

  if (
    input.budgetLimit !== null &&
    input.projectedBudgetDifference !== null &&
    input.projectedBudgetDifference > 0
  ) {
    addAlert(alerts, {
      type: "monthly_pace",
      title: "Ritmo acima da meta",
      message: `Neste ritmo, você pode fechar o mês ${formatCurrency(input.projectedBudgetDifference)} acima da meta.`,
      severity: "warning",
      priority: 90,
    });
  }

  if (input.budgetLimit !== null && input.totalExpenses > 0) {
    const proportionalBudget =
      input.budgetLimit * (input.currentDay / input.daysInMonth);

    if (input.totalExpenses < proportionalBudget * 0.9) {
      addAlert(alerts, {
        type: "positive_pace",
        title: "Você está indo bem",
        message:
          "Seu ritmo atual está abaixo do previsto para este período. Bom sinal para o fechamento do mês.",
        severity: "success",
        priority: 35,
      });
    }
  }

  for (const category of input.categoryBudgetUsages) {
    const usedPercentage = percentage(category.spentAmount, category.limitAmount);

    if (usedPercentage > 100) {
      addAlert(alerts, {
        type: "category_over_limit",
        title: "Categoria acima do limite",
        message: `Você passou do limite em ${category.categoryName} este mês.`,
        severity: "danger",
        priority: 85,
      });
      continue;
    }

    if (usedPercentage >= 80) {
      addAlert(alerts, {
        type: "category_near_limit",
        title: "Categoria perto do limite",
        message: `${category.categoryName} já consumiu ${usedPercentage}% do limite definido para este mês.`,
        severity: "warning",
        priority: 70,
      });
    }
  }

  const isWeekendWindow = [0, 5, 6].includes(input.dayOfWeek);
  const dailyAverage = input.currentDay > 0 ? input.totalExpenses / input.currentDay : 0;

  if (
    isWeekendWindow &&
    input.weeklyExpenses > 0 &&
    dailyAverage > 0 &&
    input.weeklyExpenses > dailyAverage * 7 * 1.2
  ) {
    addAlert(alerts, {
      type: "weekend_pace",
      title: "Semana um pouco mais pesada",
      message:
        "Você gastou um pouco acima do normal nesta semana. Talvez seja bom pegar leve no fim de semana.",
      severity: "info",
      priority: 55,
    });
  }

  if (input.remainingFixedExpensesTotal > 0) {
    if (input.overdueFixedExpensesTotal > 0) {
      addAlert(alerts, {
        type: "overdue_fixed_expenses",
        title: "Fixos vencidos",
        message: `Você tem ${formatCurrency(input.overdueFixedExpensesTotal)} em gastos fixos vencidos ainda não pagos.`,
        severity: "warning",
        priority: 88,
      });
    }

    const relevantThreshold =
      input.budgetLimit === null ? 100 : Math.max(100, input.budgetLimit * 0.05);

    if (input.remainingFixedExpensesTotal >= relevantThreshold) {
      addAlert(alerts, {
        type: "remaining_fixed_expenses",
        title: "Fixos ainda pendentes",
        message: `Ainda existem ${formatCurrency(input.remainingFixedExpensesTotal)} em gastos fixos pendentes para este mês.`,
        severity: "info",
        priority: 45,
      });
    }
  }

  for (const card of input.cardLimitUsages) {
    const usedPercentage = percentage(card.usedAmount, card.limitAmount);

    if (usedPercentage >= 80) {
      addAlert(alerts, {
        type: "card_limit_usage",
        title: "Cartão perto do limite",
        message: `Seu cartão ${card.cardName} já usou ${usedPercentage}% do limite cadastrado.`,
        severity: usedPercentage > 100 ? "danger" : "warning",
        priority: usedPercentage > 100 ? 82 : 65,
      });
    }
  }

  if (alerts.length === 0) {
    addAlert(alerts, {
      type: "no_alerts",
      title: "Tudo tranquilo por aqui",
      message:
        "Nenhum alerta importante para este mês. Continue registrando seus gastos para manter a visão atualizada.",
      severity: "success",
      priority: 10,
    });
  }

  return alerts.sort((a, b) => b.priority - a.priority);
}
