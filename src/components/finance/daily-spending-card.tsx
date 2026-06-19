import { Gauge } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { DailySpendingAllowance } from "@/server/dashboard/types";

type DailySpendingCardProps = {
  allowance: DailySpendingAllowance;
  remainingFixedExpensesTotal: number;
  remainingDays: number;
};

const toneStyles = {
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  danger: "border-red-100 bg-red-50 text-red-700",
  info: "border-blue-100 bg-blue-50 text-blue-700",
};

export function DailySpendingCard({
  allowance,
  remainingFixedExpensesTotal,
  remainingDays,
}: DailySpendingCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Quanto posso gastar hoje?
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Considera meta, gastos do mês e fixos ainda não pagos.
          </p>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${toneStyles[allowance.tone]}`}
          aria-hidden="true"
        >
          <Gauge size={19} strokeWidth={2.2} />
        </span>
      </div>

      <strong className="mt-5 block text-3xl font-semibold text-slate-950">
        {allowance.safeDailyAmount === null
          ? "Sem meta"
          : formatCurrency(allowance.safeDailyAmount)}
      </strong>
      <p
        className={`mt-3 text-sm leading-6 ${
          allowance.tone === "danger"
            ? "text-red-700"
            : allowance.tone === "warning"
              ? "text-amber-700"
              : allowance.tone === "success"
                ? "text-emerald-700"
                : "text-slate-600"
        }`}
      >
        {allowance.message}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Disponível real</p>
          <strong className="mt-1 block text-lg font-semibold text-slate-950">
            {allowance.availableRealAmount === null
              ? "Sem meta"
              : formatCurrency(allowance.availableRealAmount)}
          </strong>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Fixos pendentes</p>
          <strong className="mt-1 block text-lg font-semibold text-slate-950">
            {formatCurrency(remainingFixedExpensesTotal)}
          </strong>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Cálculo dividido por {remainingDays} dia(s) restante(s), incluindo hoje.
      </p>
    </section>
  );
}
