import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Gauge,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { MonthlyDashboard } from "@/server/dashboard/types";
import { AnimatedCurrency } from "./animated-currency";

type HeroDashboardProps = {
  currentMonth: string;
  dashboard: MonthlyDashboard;
};

const toneClasses = {
  info: "bg-white/10 text-white/76",
  success: "bg-[#b9f6d2] text-[#123d28]",
  warning: "bg-[#ffe8a8] text-[#624500]",
  danger: "bg-[#ffd2cb] text-[#70251b]",
};

function getCashFlowStatus(dashboard: MonthlyDashboard) {
  if (dashboard.totalIncome === 0) {
    return { label: "Entradas não registradas", tone: "info" as const };
  }

  if (dashboard.balanceAfterCommitments < 0) {
    return { label: "Atenção ao fluxo", tone: "danger" as const };
  }

  if (dashboard.overdueFixedExpensesTotal > 0) {
    return { label: "Há contas vencidas", tone: "warning" as const };
  }

  return { label: "Fluxo sob controle", tone: "success" as const };
}

function getCashFlowMessage(dashboard: MonthlyDashboard) {
  if (dashboard.totalIncome === 0) {
    return "Registre suas entradas para enxergar como o dinheiro atravessa o mês.";
  }

  if (dashboard.balanceAfterCommitments < 0) {
    return `Ainda faltam ${formatCurrency(Math.abs(dashboard.balanceAfterCommitments))} para cobrir todos os compromissos.`;
  }

  return `Depois de tudo, a previsão é preservar ${formatCurrency(dashboard.balanceAfterCommitments)}.`;
}

function getFlowPercentage(value: number, total: number) {
  if (value <= 0 || total <= 0) {
    return 0;
  }

  return Math.max(Math.min((value / total) * 100, 100), 6);
}

export function HeroDashboard({
  currentMonth,
  dashboard,
}: HeroDashboardProps) {
  const status = getCashFlowStatus(dashboard);
  const monthProgress = Math.min(
    Math.round((dashboard.currentDay / dashboard.daysInMonth) * 100),
    100,
  );
  const incomeReference = Math.max(
    dashboard.totalIncome,
    dashboard.totalCommitted,
    1,
  );
  const paidPercentage = getFlowPercentage(
    dashboard.paidExpensesTotal,
    incomeReference,
  );
  const pendingPercentage = getFlowPercentage(
    dashboard.outstandingBillsTotal,
    incomeReference,
  );
  const freePercentage = getFlowPercentage(
    Math.max(dashboard.balanceAfterCommitments, 0),
    incomeReference,
  );
  const safeDailyAmount = dashboard.dailySpendingAllowance.safeDailyAmount;

  return (
    <section className="relative overflow-hidden rounded-[2.4rem] bg-[var(--app-primary)] text-white shadow-[0_36px_110px_rgb(17_25_20_/_0.26)]">
      <div className="ambient-orb pointer-events-none absolute -right-28 -top-40 size-[32rem] rounded-full bg-[#2d9e68]/35 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-[#d8f3e4]/10 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_35%,rgb(255_255_255_/_0.035),transparent_68%)]" />

      <div className="relative grid min-h-[39rem] lg:grid-cols-[1.38fr_0.62fr]">
        <article className="flex flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/58">
              <CalendarDays size={16} aria-hidden="true" />
              {currentMonth}
            </span>
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${toneClasses[status.tone]}`}
            >
              {status.label}
            </span>
          </div>

          <div className="max-w-4xl py-4">
            <p className="text-sm font-semibold text-white/52">
              Compromissos deste mês
            </p>
            <AnimatedCurrency
              value={dashboard.outstandingBillsTotal}
              className="mt-4 block text-[clamp(3.6rem,12vw,8rem)] font-semibold leading-[0.82] tracking-[-0.085em] text-white tabular-nums"
            />
            <p className="mt-7 max-w-2xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
              {getCashFlowMessage(dashboard)}
            </p>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.14em] text-white/38">
                  Caminho do dinheiro
                </p>
                <p className="mt-1 text-sm text-white/58">
                  De tudo que entrou para o que já tem destino.
                </p>
              </div>
              <Sparkles className="text-[#7ee9ae]" size={20} aria-hidden="true" />
            </div>

            <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-2.5 backdrop-blur-xl">
              <div className="flex h-4 gap-1 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className="flow-line rounded-full bg-[#72e6a5]"
                  style={{ width: `${paidPercentage}%`, animationDelay: "80ms" }}
                  title={`Já pago: ${formatCurrency(dashboard.paidExpensesTotal)}`}
                />
                <span
                  className="flow-line rounded-full bg-[#f3c969]"
                  style={{ width: `${pendingPercentage}%`, animationDelay: "170ms" }}
                  title={`Pendente: ${formatCurrency(dashboard.outstandingBillsTotal)}`}
                />
                <span
                  className="flow-line rounded-full bg-white/24"
                  style={{ width: `${freePercentage}%`, animationDelay: "260ms" }}
                  title={`Livre: ${formatCurrency(Math.max(dashboard.balanceAfterCommitments, 0))}`}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["Já pago", dashboard.paidExpensesTotal, "bg-[#72e6a5]"],
                  ["A pagar", dashboard.outstandingBillsTotal, "bg-[#f3c969]"],
                  ["Livre", Math.max(dashboard.balanceAfterCommitments, 0), "bg-white/35"],
                ].map(([label, value, color]) => (
                  <div key={String(label)} className="min-w-0 rounded-2xl bg-white/[0.045] p-3">
                    <span className={`mb-2 block size-1.5 rounded-full ${color}`} />
                    <p className="truncate text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white/38">
                      {label}
                    </p>
                    <strong className="mt-1 block truncate text-xs font-bold text-white/82 sm:text-sm">
                      {formatCurrency(Number(value))}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <aside className="m-2 mt-0 flex flex-col gap-2 rounded-[2rem] bg-[#f1efe7] p-3 text-[var(--app-ink)] sm:m-3 sm:mt-0 sm:p-4 lg:m-3 lg:ml-0">
          <article className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-[1.55rem] bg-[var(--app-surface)] p-5 shadow-sm sm:p-6">
            <div className="absolute -right-14 -top-14 size-44 rounded-full bg-[var(--app-accent-soft)] blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                <Gauge size={20} aria-hidden="true" />
              </span>
              <div
                className="grid size-20 place-items-center rounded-full p-1"
                style={{
                  background: `conic-gradient(var(--app-accent) ${monthProgress}%, var(--app-surface-muted) ${monthProgress}% 100%)`,
                }}
                aria-label={`${monthProgress}% do mês concluído`}
              >
                <span className="grid size-full place-items-center rounded-full bg-[var(--app-surface)] text-xs font-extrabold">
                  {monthProgress}%
                </span>
              </div>
            </div>

            <div className="relative mt-12">
              <p className="section-eyebrow">Seu ritmo hoje</p>
              <strong className="mt-3 block text-4xl font-extrabold tracking-[-0.06em] sm:text-5xl">
                {safeDailyAmount === null
                  ? "Sem meta"
                  : formatCurrency(safeDailyAmount)}
              </strong>
              <p className="mt-3 text-sm leading-6 text-[var(--app-ink-muted)]">
                {dashboard.dailySpendingAllowance.message}
              </p>
            </div>
          </article>

          <article className="rounded-[1.55rem] bg-[var(--app-accent-soft)] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-white/72 text-[var(--app-accent)]">
                {dashboard.overdueFixedExpensesTotal > 0 ? (
                  <CircleAlert size={18} aria-hidden="true" />
                ) : (
                  <ReceiptText size={18} aria-hidden="true" />
                )}
              </span>
              <span className="text-xs font-extrabold text-[var(--app-accent)]">
                {dashboard.remainingDays} dias restantes
              </span>
            </div>
            <p className="mt-5 text-sm font-extrabold">Próximos compromissos</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/55 p-3">
                <span className="text-[0.67rem] font-bold text-[var(--app-ink-muted)]">Contas fixas</span>
                <strong className="mt-1 block text-sm font-extrabold">
                  {formatCurrency(dashboard.remainingFixedExpensesTotal)}
                </strong>
              </div>
              <div className="rounded-2xl bg-white/55 p-3">
                <span className="text-[0.67rem] font-bold text-[var(--app-ink-muted)]">Fatura vigente</span>
                <strong className="mt-1 block text-sm font-extrabold">
                  {formatCurrency(dashboard.cardInvoicesTotal)}
                </strong>
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <Link href="/ajustes" className="inline-flex items-center gap-1 text-sm font-extrabold text-[var(--app-accent)]">
                Contas
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link href="/cartoes" className="inline-flex items-center gap-1 text-sm font-extrabold text-[var(--app-accent)]">
                Cartões
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
