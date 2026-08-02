import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { MonthlyDashboard } from "@/server/dashboard/types";

type HeroDashboardProps = {
  currentMonth: string;
  dashboard: MonthlyDashboard;
};

const toneClasses = {
  info: "bg-white/10 text-white/80",
  success: "bg-[#b9f6d2] text-[#123d28]",
  warning: "bg-[#ffe8a8] text-[#624500]",
  danger: "bg-[#ffd2cb] text-[#70251b]",
};

function getCashFlowStatus(dashboard: MonthlyDashboard) {
  if (dashboard.totalIncome === 0) {
    return { label: "Entradas não registradas", tone: "info" as const };
  }

  if (dashboard.balanceAfterCommitments < 0) {
    return { label: "Falta cobrir parte do mês", tone: "danger" as const };
  }

  if (dashboard.overdueFixedExpensesTotal > 0) {
    return { label: "Há contas vencidas", tone: "warning" as const };
  }

  if (dashboard.remainingFixedExpensesTotal === 0) {
    return { label: "Contas fixas em dia", tone: "success" as const };
  }

  return { label: "Fluxo do mês positivo", tone: "success" as const };
}

function getCashFlowMessage(dashboard: MonthlyDashboard) {
  if (dashboard.remainingFixedExpensesTotal === 0) {
    return "Nenhuma conta fixa está pendente neste mês. O saldo considera tudo o que entrou e já foi registrado.";
  }

  const balance = Math.abs(dashboard.balanceAfterCommitments);

  if (dashboard.balanceAfterCommitments < 0) {
    return `Depois dos gastos e das contas pendentes, ainda faltam ${formatCurrency(balance)} para fechar o mês.`;
  }

  return `Depois dos gastos e das contas pendentes, a previsão é sobrar ${formatCurrency(balance)} neste mês.`;
}

function getCashFlowInsight(dashboard: MonthlyDashboard) {
  if (dashboard.totalIncome === 0) {
    return {
      title: "Registre o que entrou no mês",
      message:
        "As entradas são necessárias para calcular quanto sobra depois dos gastos e das contas pendentes.",
    };
  }

  if (dashboard.balanceAfterCommitments < 0) {
    return {
      title: "As entradas ainda não cobrem tudo",
      message: `Faltam ${formatCurrency(Math.abs(dashboard.balanceAfterCommitments))} para cobrir os gastos registrados e as contas que ainda vencem.`,
    };
  }

  if (dashboard.remainingFixedExpensesTotal === 0) {
    return {
      title: "As contas previstas estão em dia",
      message: `Depois do que já foi gasto, seu saldo atual é ${formatCurrency(dashboard.balanceAfterExpenses)}.`,
    };
  }

  return {
    title: "As contas previstas cabem nas entradas",
    message: `${formatCurrency(dashboard.remainingFixedExpensesTotal)} ainda estão reservados para contas fixas deste mês.`,
  };
}

export function HeroDashboard({
  currentMonth,
  dashboard,
}: HeroDashboardProps) {
  const status = getCashFlowStatus(dashboard);
  const balanceIsPositive = dashboard.balanceAfterCommitments >= 0;
  const commitmentPercentage =
    dashboard.totalIncome > 0
      ? Math.round((dashboard.totalCommitted / dashboard.totalIncome) * 100)
      : null;
  const insight = getCashFlowInsight(dashboard);

  return (
    <section className="grid gap-4 lg:grid-cols-[1.42fr_0.58fr]">
      <article className="relative min-h-[29rem] overflow-hidden rounded-[2rem] bg-[var(--app-primary)] p-5 text-white shadow-[0_28px_80px_rgb(20_23_21_/_0.22)] sm:p-7 lg:min-h-[31rem]">
        <div className="pointer-events-none absolute -right-24 -top-36 size-[26rem] rounded-full bg-[#4b806a]/45 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-white/[0.08] blur-3xl" />

        <div className="relative flex h-full flex-col justify-between gap-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/65">
              <CalendarDays size={16} aria-hidden="true" />
              {currentMonth}
            </span>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${toneClasses[status.tone]}`}
            >
              {status.label}
            </span>
          </div>

          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-white/58">
              Ainda falta pagar
            </p>
            <h1 className="mt-3 text-[clamp(3.25rem,12vw,6.6rem)] font-bold leading-[0.86] tracking-[-0.075em] text-white">
              {formatCurrency(dashboard.remainingFixedExpensesTotal)}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
              {getCashFlowMessage(dashboard)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-5 sm:gap-4">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white/42 sm:text-xs">
                Entrou
              </p>
              <strong className="mt-2 block text-sm font-bold sm:text-lg">
                {formatCurrency(dashboard.totalIncome)}
              </strong>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white/42 sm:text-xs">
                Já gastou
              </p>
              <strong className="mt-2 block text-sm font-bold sm:text-lg">
                {formatCurrency(dashboard.totalExpenses)}
              </strong>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white/42 sm:text-xs">
                {balanceIsPositive ? "Sobra prevista" : "Falta cobrir"}
              </p>
              <strong className="mt-2 block text-sm font-bold sm:text-lg">
                {formatCurrency(Math.abs(dashboard.balanceAfterCommitments))}
              </strong>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <article className="app-card flex min-h-64 flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
              <Sparkles size={20} strokeWidth={2.15} aria-hidden="true" />
            </span>
            {commitmentPercentage !== null ? (
              <div
                className="grid size-16 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(var(--app-accent) ${Math.min(commitmentPercentage, 100)}%, var(--app-surface-muted) ${Math.min(commitmentPercentage, 100)}% 100%)`,
                }}
                aria-label={`${commitmentPercentage}% das entradas comprometidas`}
              >
                <span className="grid size-12 place-items-center rounded-full bg-white text-xs font-extrabold text-[var(--app-ink)]">
                  {commitmentPercentage}%
                </span>
              </div>
            ) : null}
          </div>

          <div className="mt-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--app-ink-faint)]">
              Leitura do mês
            </p>
            <h2 className="mt-3 text-xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--app-ink)]">
              {insight.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--app-ink-muted)]">
              {insight.message}
            </p>
          </div>
        </article>

        <article className="rounded-[1.75rem] bg-[var(--app-accent-soft)] p-5 sm:p-6">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white/75 text-[var(--app-accent)] shadow-sm">
            {dashboard.overdueFixedExpensesTotal > 0 ? (
              <CircleAlert size={19} aria-hidden="true" />
            ) : (
              <ReceiptText size={19} aria-hidden="true" />
            )}
          </span>
          <p className="mt-5 text-sm font-bold text-[var(--app-ink)]">
            {dashboard.overdueFixedExpensesTotal > 0
              ? "Contas vencidas"
              : "Contas fixas pendentes"}
          </p>
          <strong className="mt-1 block text-3xl font-bold tracking-[-0.045em] text-[var(--app-ink)]">
            {dashboard.overdueFixedExpensesTotal > 0
              ? formatCurrency(dashboard.overdueFixedExpensesTotal)
              : `${dashboard.remainingFixedExpenses.length} conta${dashboard.remainingFixedExpenses.length === 1 ? "" : "s"}`}
          </strong>
          <Link
            href="/ajustes"
            className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--app-accent)]"
          >
            Conferir contas fixas
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>
      </div>
    </section>
  );
}
