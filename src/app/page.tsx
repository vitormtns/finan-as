import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Landmark,
  ListChecks,
  Plus,
  TrendingUp,
} from "lucide-react";
import { AlertsList } from "@/components/finance/alerts-list";
import { CategoryList } from "@/components/finance/category-list";
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
        "Não foi possível carregar sua visão financeira. Verifique a conexão e tente novamente.",
    };
  }
}

export default async function Home() {
  const { dashboard, alerts, error } = await loadDashboard();
  const currentMonth = formatMonth(new Date());
  const secondaryAlerts = alerts.slice(0, 3);

  return (
    <div className="app-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-5 sm:px-6 md:py-8 lg:px-8">
        <header className="flex items-center justify-between md:hidden">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--app-ink-faint)]">
              Meu Mês
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-ink)]">
              Visão geral
            </h1>
          </div>
          <Link
            href="/novo?tipo=despesa"
            className="flex size-11 items-center justify-center rounded-2xl bg-[var(--app-primary)] text-white shadow-[0_10px_24px_rgb(20_23_21_/_0.2)]"
            aria-label="Registrar movimentação"
          >
            <Plus size={21} aria-hidden="true" />
          </Link>
        </header>

        {error ? (
          <section className="alert-danger p-4 text-sm leading-6">{error}</section>
        ) : null}

        {dashboard ? (
          <>
            <HeroDashboard
              currentMonth={currentMonth}
              dashboard={dashboard}
            />

            <section aria-labelledby="acoes-rapidas">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="section-eyebrow">Todos os dias</p>
                  <h2 id="acoes-rapidas" className="section-title mt-1">
                    Ações rápidas
                  </h2>
                </div>
                <Link
                  href="/gastos"
                  className="hidden items-center gap-1 text-sm font-extrabold text-[var(--app-ink-muted)] sm:inline-flex"
                >
                  Ver tudo
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  href="/novo?tipo=despesa"
                  className="quick-action group"
                >
                  <span className="quick-action-icon bg-[#fff0ed] text-[#a54535]">
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>Registrar despesa</strong>
                    <small>O que saiu agora</small>
                  </span>
                  <ArrowRight className="ml-auto text-[var(--app-ink-faint)] transition group-hover:translate-x-1" size={18} aria-hidden="true" />
                </Link>

                <Link
                  href="/novo?tipo=receita"
                  className="quick-action group"
                >
                  <span className="quick-action-icon bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                    <ArrowDownLeft size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>Registrar receita</strong>
                    <small>O que entrou hoje</small>
                  </span>
                  <ArrowRight className="ml-auto text-[var(--app-ink-faint)] transition group-hover:translate-x-1" size={18} aria-hidden="true" />
                </Link>

                <Link href="/gastos" className="quick-action group">
                  <span className="quick-action-icon bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                    <ListChecks size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>Ver movimentos</strong>
                    <small>Revisar e corrigir</small>
                  </span>
                  <ArrowRight className="ml-auto text-[var(--app-ink-faint)] transition group-hover:translate-x-1" size={18} aria-hidden="true" />
                </Link>

                <Link href="/cartoes" className="quick-action group">
                  <span className="quick-action-icon bg-[#e7e6ff] text-[#5148a8]">
                    <CreditCard size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>Gerenciar cartões</strong>
                    <small>Faturas e compras</small>
                  </span>
                  <ArrowRight className="ml-auto text-[var(--app-ink-faint)] transition group-hover:translate-x-1" size={18} aria-hidden="true" />
                </Link>
              </div>
            </section>

            {dashboard.budgetLimit === null ? (
              <section className="flex flex-col gap-4 rounded-[1.75rem] border border-dashed border-[var(--app-border-strong)] bg-white/55 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <p className="section-eyebrow">Falta só uma informação</p>
                  <h2 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[var(--app-ink)]">
                    Defina quanto pretende gastar no mês
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-ink-muted)]">
                    Com uma meta, o aplicativo calcula automaticamente seu valor livre por dia e antecipa desvios.
                  </p>
                </div>
                <Link href="/metas" className="btn-primary shrink-0">
                  Criar planejamento
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </section>
            ) : null}

            <section aria-labelledby="pulso-do-mes">
              <div className="mb-4">
                <p className="section-eyebrow">Entradas, saídas e compromissos</p>
                <h2 id="pulso-do-mes" className="section-title mt-1">
                  Pulso do mês
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <article className="metric-card">
                  <span className="metric-card-icon bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                    <Landmark size={18} aria-hidden="true" />
                  </span>
                  <p>Já saiu</p>
                  <strong>{formatCurrency(dashboard.paidExpensesTotal)}</strong>
                  <small>Pagamentos em Pix, débito, dinheiro e outras formas imediatas.</small>
                </article>

                <article className="metric-card">
                  <span className="metric-card-icon bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                    <TrendingUp size={18} aria-hidden="true" />
                  </span>
                  <p>Contas a pagar</p>
                  <strong>{formatCurrency(dashboard.outstandingBillsTotal)}</strong>
                  <small>Contas fixas mais a fatura vigente dos cartões.</small>
                </article>

                <article className="metric-card">
                  <span className="metric-card-icon bg-[#fff3d6] text-[#87600b]">
                    <ArrowDownLeft size={18} aria-hidden="true" />
                  </span>
                  <p>Saldo depois das contas</p>
                  <strong>{formatCurrency(dashboard.balanceAfterCommitments)}</strong>
                  <small>Quanto deve sobrar após os compromissos pendentes.</small>
                </article>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <WeeklySummaryCard summary={dashboard.weeklySummary} />
              <MonthProjectionCard
                dailyAverage={dashboard.dailyAverage}
                projectedMonthTotal={dashboard.projectedMonthTotal}
                projectedBudgetDifference={dashboard.projectedBudgetDifference}
              />
            </section>

            <section aria-labelledby="detalhes-do-mes">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="section-eyebrow">Quando quiser aprofundar</p>
                  <h2 id="detalhes-do-mes" className="section-title mt-1">
                    Detalhes do mês
                  </h2>
                </div>
                <Link
                  href="/relatorios"
                  className="inline-flex items-center gap-1 text-sm font-extrabold text-[var(--app-ink-muted)]"
                >
                  Relatórios
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="space-y-5">
                  <CategoryList categories={dashboard.categoryExpenses} />
                  <FixedExpensesCard
                    expenses={dashboard.remainingFixedExpenses}
                    total={dashboard.remainingFixedExpensesTotal}
                  />
                </div>

                <div className="space-y-5">
                  {secondaryAlerts.length > 0 ? (
                    <AlertsList alerts={secondaryAlerts} />
                  ) : (
                    <section className="app-card p-5 sm:p-6">
                      <p className="section-eyebrow">Insights</p>
                      <h2 className="mt-2 text-lg font-extrabold text-[var(--app-ink)]">
                        Nada urgente por aqui
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[var(--app-ink-muted)]">
                        Continue registrando seus movimentos para manter as recomendações precisas.
                      </p>
                    </section>
                  )}

                  <Link
                    href="/ajustes"
                    className="group flex items-center justify-between rounded-[1.75rem] bg-[var(--app-primary)] p-5 text-white shadow-[0_20px_55px_rgb(20_23_21_/_0.17)] sm:p-6"
                  >
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-[0.08em] text-white/48">
                        Automatize o cotidiano
                      </span>
                      <strong className="mt-2 block text-lg font-extrabold">
                        Organizar gastos fixos
                      </strong>
                    </span>
                    <span className="flex size-11 items-center justify-center rounded-full bg-white/10 transition group-hover:bg-white/16">
                      <ArrowRight size={19} aria-hidden="true" />
                    </span>
                  </Link>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>
      <MobileNavigation />
    </div>
  );
}
