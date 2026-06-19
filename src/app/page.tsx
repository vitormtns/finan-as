import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { AddExpenseButton } from "@/components/finance/add-expense-button";
import { AlertCard } from "@/components/finance/alert-card";
import { AlertsList } from "@/components/finance/alerts-list";
import { CategoryList } from "@/components/finance/category-list";
import { DailySpendingCard } from "@/components/finance/daily-spending-card";
import { FinancialSummaryCard } from "@/components/finance/financial-summary-card";
import { FixedExpensesCard } from "@/components/finance/fixed-expenses-card";
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
      alerts: await generateFinancialAlertsFromDashboard(
        userId,
        dashboard,
      ),
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] pb-28 md:pb-0">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 md:py-8 lg:px-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-100/70">
              <CalendarDays size={16} aria-hidden="true" />
              {currentMonth}
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Meu Mês
            </h1>
            <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
              Uma visão clara do mês atual com gastos, receitas, meta e ritmo
              financeiro.
            </p>
          </div>
          <AddExpenseButton />
        </header>

        {error ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </section>
        ) : null}

        {dashboard ? (
          <>
            {mainAlert ? (
              <AlertCard
                title={mainAlert.title}
                description={mainAlert.message}
                status={
                  mainAlert.severity === "success"
                    ? "Tudo certo"
                    : mainAlert.severity === "danger"
                      ? "Atenção"
                      : "Conselho"
                }
                tone={mainAlert.severity}
              />
            ) : null}

            {dashboard.budgetLimit === null ? (
              <section className="rounded-lg border border-dashed border-blue-200 bg-blue-50 p-4 shadow-sm shadow-blue-100/70">
                <h2 className="text-base font-semibold text-slate-950">
                  Meta mensal não configurada
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Cadastre um orçamento para calcular valor disponível, limite
                  seguro por dia e comparação com a projeção do mês.
                </p>
                <Link
                  href="/metas"
                  className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Configurar meta
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </section>
            ) : null}

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FinancialSummaryCard
                title="Total gasto"
                value={formatCurrency(dashboard.totalExpenses)}
                description="Soma das despesas registradas no mês."
                icon={WalletCards}
                tone="primary"
              />
              <FinancialSummaryCard
                title="Receitas"
                value={formatCurrency(dashboard.totalIncome)}
                description="Entradas registradas no mês atual."
                icon={TrendingUp}
                tone="success"
              />
              <FinancialSummaryCard
                title="Meta mensal"
                value={
                  dashboard.budgetLimit === null
                    ? "Não definida"
                    : formatCurrency(dashboard.budgetLimit)
                }
                description="Limite planejado para o mês atual."
                icon={PiggyBank}
                tone={dashboard.budgetLimit === null ? "warning" : "success"}
              />
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
                    ? "Valor que já passou do orçamento mensal."
                    : "Antes de reservar os gastos fixos futuros."
                }
                icon={TrendingDown}
                tone={
                  dashboard.availableAmount !== null &&
                  dashboard.availableAmount < 0
                    ? "warning"
                    : "neutral"
                }
              />
            </section>

            <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <DailySpendingCard
                allowance={dashboard.dailySpendingAllowance}
                remainingFixedExpensesTotal={
                  dashboard.remainingFixedExpensesTotal
                }
                remainingDays={dashboard.remainingDays}
              />
              <WeeklySummaryCard summary={dashboard.weeklySummary} />
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                title="Fixos restantes"
                value={formatCurrency(dashboard.remainingFixedExpensesTotal)}
                description="Estimativa dos gastos fixos ainda pendentes."
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
                  projectedBudgetDifference={
                    dashboard.projectedBudgetDifference
                  }
                />

                <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                  <h2 className="text-base font-semibold text-slate-950">
                    Próxima ação
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Registre gastos assim que eles acontecerem para manter a
                    projeção fiel ao seu mês.
                  </p>
                  <Link
                    href="/alertas"
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
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
