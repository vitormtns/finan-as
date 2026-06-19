import { Gauge } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { DailySpendingAllowance } from "@/server/dashboard/types";

type DailySpendingCardProps = {
  allowance: DailySpendingAllowance;
  remainingFixedExpensesTotal: number;
  remainingDays: number;
};

const toneStyles = {
  success: "text-[var(--app-accent)] bg-[var(--app-accent-soft)]",
  warning: "text-[var(--app-warning)] bg-[var(--app-warning-soft)]",
  danger: "text-[var(--app-danger)] bg-[var(--app-danger-soft)]",
  info: "text-[var(--app-primary)] bg-[var(--app-primary-soft)]",
};

export function DailySpendingCard({
  allowance,
  remainingFixedExpensesTotal,
  remainingDays,
}: DailySpendingCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 p-5 shadow-[0_22px_58px_rgb(16_25_35_/_0.1)] backdrop-blur">
      <div className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-emerald-200/35 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--app-ink-muted)]">
              Hoje
            </p>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-[var(--app-ink)]">
              Quanto posso gastar?
            </h2>
          </div>
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${toneStyles[allowance.tone]}`}
            aria-hidden="true"
          >
            <Gauge size={20} strokeWidth={2.2} />
          </span>
        </div>

        <strong className="mt-6 block text-5xl font-bold leading-none tracking-normal text-[var(--app-ink)]">
          {allowance.safeDailyAmount === null
            ? "Sem meta"
            : formatCurrency(allowance.safeDailyAmount)}
        </strong>
        <p
          className={`mt-4 text-sm leading-6 ${
            allowance.tone === "danger"
              ? "text-[var(--app-danger)]"
              : allowance.tone === "warning"
                ? "text-[var(--app-warning)]"
                : allowance.tone === "success"
                  ? "text-[var(--app-accent)]"
                  : "text-[var(--app-ink-muted)]"
          }`}
        >
          {allowance.message}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-[1.15rem] bg-[var(--app-primary)] p-4 text-white">
            <p className="text-xs font-semibold text-white/55">
              Disponível real
            </p>
            <strong className="mt-2 block text-xl font-bold">
              {allowance.availableRealAmount === null
                ? "Sem meta"
                : formatCurrency(allowance.availableRealAmount)}
            </strong>
          </div>
          <div className="rounded-[1.15rem] bg-[var(--app-surface-muted)] p-4">
            <p className="text-xs font-semibold text-[var(--app-ink-muted)]">
              Fixos pendentes
            </p>
            <strong className="mt-2 block text-xl font-bold text-[var(--app-ink)]">
              {formatCurrency(remainingFixedExpensesTotal)}
            </strong>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--app-ink-muted)]">
          Cálculo dividido por {remainingDays} dia(s) restante(s), incluindo hoje.
        </p>
      </div>
    </section>
  );
}
