import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { AlertsList } from "@/components/finance/alerts-list";
import { CategoryList } from "@/components/finance/category-list";
import { DailySpendingCard } from "@/components/finance/daily-spending-card";
import { FinanceMetricGrid } from "@/components/finance/finance-metric-grid";
import { FinancialSummaryCard } from "@/components/finance/financial-summary-card";
import { FixedExpensesCard } from "@/components/finance/fixed-expenses-card";
import { HeroDashboard } from "@/components/finance/hero-dashboard";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { MonthProjectionCard } from "@/components/finance/month-projection-card";
import { WeeklySummaryCard } from "@/components/finance/weekly-summary-card";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { generateFinancialAlertsFromDashboard } from "@/server/alerts/service";
import { getMonthlyDashboard } from "@/server/dashboard/service";

export const dynamic = "force-dynamic";

async function loadDashboard() {
  const userId = await requireCurrentUserId();

  try {
    const dashboard = await getMonthlyDashboard(userId);

    return {
      dashboard,
      alerts: await generateFinancialAlertsFromDashboard(userId, dashboard),
      error: null,
    };
  } catch {
    return {
      dashboard: null,
      alerts: [],
      error:
        "Não foi possível carregar a dashboard. Verifique a conexão com o banco de dados.",
    };
  }
}

export default async function Home() {
  const { dashboard, alerts, error } = await loadDashboard();
  const currentMonth = formatMonth(new Date());
  const mainAlert = alerts[0];
  const secondaryAlerts = alerts.slice(1, 4);

  return (
    <div className="app-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-4 sm:px-6 md:py-7 lg:px-8">
        {error ? (
          <section className="alert-danger p-4 text-sm leading-6">{error}</section>
        ) : null}

        {dashboard ? (
          <>
            <HeroDashboard
              currentMonth={currentMonth}
              dashboard={dashboard}
              mainAlert={mainAlert}
            />

            {dashboard.budgetLimit === null ? (
              <section className="rounded-[1.5rem] border border-dashed border-[var(--app-border-strong)] bg-white/60 p-5 shadow-[0_18px_42px_rgb(16_25_35_/_0.08)] backdrop-blur">
                <h2 className="text-base font-bold text-[var(--app-ink)]">
                  Meta mensal não configurada
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--app-ink-muted)]">
                  Cadastre um orçamento para calcular valor disponível, limite
                  seguro por dia e comparação com a projeção do mês.
                </p>
                <Link href="/metas" className="btn-primary mt-4">
                  Configurar meta
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </section>
            ) : null}

            <FinanceMetricGrid
              metrics={[
                {
                  title: "Total gasto",
                  value: formatCurrency(dashboard.totalExpenses),
                  description: "Tudo que saiu neste mês, já somado para leitura rápida.",
                  icon: WalletCards,
                  tone: "ink",
                  featured: true,
                },
                {
                  title: "Receitas",
                  value: formatCurrency(dashboard.totalIncome),
                  description: "Entradas registradas no mês.",
                  icon: TrendingUp,
                  tone: "emerald",
                },
                {
                  title: "Meta mensal",
                  value:
                    dashboard.budgetLimit === null
                      ? "Não definida"
                      : formatCurrency(dashboard.budgetLimit),
                  description: "Seu limite planejado.",
                  icon: PiggyBank,
                  tone: dashboard.budgetLimit === null ? "warm" : "muted",
                },
              ]}
            />

            <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <DailySpendingCard
                allowance={dashboard.dailySpendingAllowance}
                remainingFixedExpensesTotal={dashboard.remainingFixedExpensesTotal}
                remainingDays={dashboard.remainingDays}
              />
              <WeeklySummaryCard summary={dashboard.weeklySummary} />
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FinancialSummaryCard
                title={
                  dashboard.availableAmount !== null &&
                  dashboard.availableAmount < 0
                    ? "Acima da meta"
                    : "Saldo da meta"
                }
                value={
                  dashboard.availableAmount === null
                    ? "Sem meta"
                    : formatCurrency(Math.abs(dashboard.availableAmount))
                }
                description={
                  dashboard.availableAmount !== null &&
                  dashboard.availableAmount < 0
                    ? "Valor acima do orçamento mensal."
                    : "Margem antes dos fixos futuros."
                }
                icon={TrendingDown}
                tone={
                  dashboard.availableAmount !== null &&
                  dashboard.availableAmount < 0
                    ? "warning"
                    : "success"
                }
              />
              <FinancialSummaryCard
                title="Fixos restantes"
                value={formatCurrency(dashboard.remainingFixedExpensesTotal)}
                description="Compromissos ainda pendentes."
                icon={CalendarDays}
                tone="neutral"
              />
              <FinancialSummaryCard
                title="Projeção"
                value={formatCurrency(dashboard.projectedMonthTotal)}
                description="Fechamento estimado pelo ritmo atual."
                icon={TrendingUp}
                tone={
                  dashboard.projectedBudgetDifference !== null &&
                  dashboard.projectedBudgetDifference > 0
                    ? "warning"
                    : "success"
                }
              />
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <FinancialSummaryCard
                title="Maior categoria"
                value={dashboard.largestCategory?.name ?? "Sem gastos"}
                description={
                  dashboard.largestCategory
                    ? `${formatCurrency(dashboard.largestCategory.amount)} neste mês.`
                    : "Nenhuma despesa lançada ainda."
                }
                icon={WalletCards}
                tone="neutral"
              />
              <FinancialSummaryCard
                title="Média diária"
                value={formatCurrency(dashboard.dailyAverage)}
                description="Ritmo médio dos lançamentos no mês."
                icon={TrendingDown}
                tone={
                  dashboard.projectedBudgetDifference !== null &&
                  dashboard.projectedBudgetDifference > 0
                    ? "warning"
                    : "success"
                }
              />
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-6">
                <CategoryList categories={dashboard.categoryExpenses} />
                <FixedExpensesCard
                  expenses={dashboard.remainingFixedExpenses}
                  total={dashboard.remainingFixedExpensesTotal}
                />
              </div>

              <div className="space-y-6">
                {secondaryAlerts.length > 0 ? (
                  <AlertsList alerts={secondaryAlerts} />
                ) : null}

                <MonthProjectionCard
                  dailyAverage={dashboard.dailyAverage}
                  projectedMonthTotal={dashboard.projectedMonthTotal}
                  projectedBudgetDifference={dashboard.projectedBudgetDifference}
                />

                <section className="rounded-[1.5rem] border border-white/70 bg-white/70 p-5 shadow-[0_18px_48px_rgb(16_25_35_/_0.08)] backdrop-blur">
                  <h2 className="text-base font-bold text-[var(--app-ink)]">
                    Próxima ação
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--app-ink-muted)]">
                    Registre gastos assim que eles acontecerem para manter a
                    projeção fiel ao seu mês.
                  </p>
                  <Link href="/alertas" className="btn-secondary mt-4 w-full">
                    Ver todos os alertas
                  </Link>
                </section>
              </div>
            </div>
          </>
        ) : null}
      </main>
      <MobileNavigation />
    </div>
  );
}
