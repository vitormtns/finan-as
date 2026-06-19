import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Plus,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { FinancialAlert } from "@/server/alerts/types";
import type { MonthlyDashboard } from "@/server/dashboard/types";

type HeroDashboardProps = {
  currentMonth: string;
  dashboard: MonthlyDashboard;
  mainAlert?: FinancialAlert;
};

function getBudgetProgress(dashboard: MonthlyDashboard) {
  if (!dashboard.budgetLimit || dashboard.budgetLimit <= 0) {
    return null;
  }

  return Math.min(
    Math.round((dashboard.totalExpenses / dashboard.budgetLimit) * 100),
    140,
  );
}

function getInsightStatus(alert?: FinancialAlert) {
  if (!alert) {
    return "Ritmo do mês";
  }

  if (alert.severity === "success") {
    return "Bom sinal";
  }

  if (alert.severity === "danger") {
    return "Atenção fina";
  }

  if (alert.severity === "warning") {
    return "Ponto de cuidado";
  }

  return "Insight";
}

export function HeroDashboard({
  currentMonth,
  dashboard,
  mainAlert,
}: HeroDashboardProps) {
  const budgetProgress = getBudgetProgress(dashboard);
  const availableAmount = dashboard.availableAmount;
  const safeDailyAmount = dashboard.dailySpendingAllowance.safeDailyAmount;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#fffdf8_0%,#edf4ee_42%,#dfe8e7_100%)] p-4 shadow-[0_28px_70px_rgb(16_25_35_/_0.12)] sm:p-5 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-5">
      <div className="pointer-events-none absolute -left-16 -top-24 size-72 rounded-full bg-emerald-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-0 size-80 rounded-full bg-slate-300/40 blur-3xl" />

      <div className="relative flex min-h-[31rem] flex-col justify-between rounded-[1.55rem] bg-[linear-gradient(150deg,#122c3a_0%,#101923_56%,#065f46_130%)] p-5 text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.12),0_22px_60px_rgb(16_25_35_/_0.22)] sm:p-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/78 backdrop-blur">
            <CalendarDays size={15} aria-hidden="true" />
            {currentMonth}
          </div>

          <div className="mt-7 max-w-md">
            <p className="text-sm font-semibold text-emerald-100/75">
              Painel financeiro pessoal
            </p>
            <h1 className="mt-2 text-5xl font-bold leading-[0.95] tracking-normal sm:text-6xl">
              Meu Mês
            </h1>
            <p className="mt-4 text-base leading-7 text-white/68">
              O essencial do seu mês em uma leitura rápida: ritmo, limite e
              próximos cuidados.
            </p>
          </div>
        </div>

        <div className="mt-9 grid gap-3">
          <div>
            <p className="text-sm font-medium text-white/58">
              Você pode gastar hoje
            </p>
            <strong className="mt-1 block text-4xl font-bold tracking-normal sm:text-5xl">
              {safeDailyAmount === null ? "Sem meta" : formatCurrency(safeDailyAmount)}
            </strong>
          </div>

          <Link
            href="/novo"
            className="group inline-flex min-h-14 items-center justify-between rounded-2xl bg-white px-4 text-sm font-bold text-[var(--app-primary)] shadow-[0_18px_38px_rgb(0_0_0_/_0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-50"
            aria-label="Adicionar gasto"
          >
            <span className="inline-flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-[var(--app-primary)] text-white">
                <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
              </span>
              Adicionar gasto
            </span>
            <ArrowUpRight
              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              size={18}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      <div className="relative mt-4 grid content-between gap-4 lg:mt-0">
        <article className="rounded-[1.55rem] border border-white/75 bg-white/72 p-5 shadow-[0_18px_48px_rgb(16_25_35_/_0.1)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--app-accent-soft)] px-3 py-1 text-xs font-bold uppercase text-[var(--app-accent)]">
              <Sparkles size={14} aria-hidden="true" />
              {getInsightStatus(mainAlert)}
            </span>
            <span className="text-xs font-semibold text-[var(--app-ink-muted)]">
              {dashboard.remainingDays} dia(s) restantes
            </span>
          </div>

          <h2 className="mt-5 text-2xl font-bold leading-tight text-[var(--app-ink)]">
            {mainAlert?.title ?? dashboard.orientation.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--app-ink-muted)]">
            {mainAlert?.message ?? dashboard.orientation.description}
          </p>

          <div className="mt-6 rounded-2xl bg-[var(--app-primary)] p-4 text-white">
            <p className="text-xs font-semibold uppercase text-white/54">
              Saldo da meta
            </p>
            <strong className="mt-1 block text-3xl font-bold tracking-normal">
              {availableAmount === null
                ? "Sem meta"
                : formatCurrency(Math.abs(availableAmount))}
            </strong>
            <p className="mt-2 text-sm text-white/64">
              {availableAmount === null
                ? "Configure uma meta para acompanhar a margem."
                : availableAmount < 0
                  ? "Acima do planejado para este mês."
                  : "Ainda disponível antes dos fixos futuros."}
            </p>
          </div>
        </article>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.25rem] border border-white/70 bg-white/68 p-4 shadow-[0_12px_32px_rgb(16_25_35_/_0.08)] backdrop-blur">
            <p className="text-xs font-semibold text-[var(--app-ink-muted)]">
              Gasto no mês
            </p>
            <strong className="mt-2 block text-2xl font-bold text-[var(--app-ink)]">
              {formatCurrency(dashboard.totalExpenses)}
            </strong>
            {budgetProgress !== null ? (
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className="h-full rounded-full bg-[var(--app-accent)]"
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--app-ink-muted)]">
                  {budgetProgress}% da meta
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.25rem] border border-white/70 bg-white/68 p-4 shadow-[0_12px_32px_rgb(16_25_35_/_0.08)] backdrop-blur">
            <span className="flex size-9 items-center justify-center rounded-full bg-[var(--app-warning-soft)] text-[var(--app-warning)]">
              <TrendingDown size={17} aria-hidden="true" />
            </span>
            <p className="mt-4 text-xs font-semibold text-[var(--app-ink-muted)]">
              Projeção
            </p>
            <strong className="mt-1 block text-2xl font-bold text-[var(--app-ink)]">
              {formatCurrency(dashboard.projectedMonthTotal)}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
