import { formatCurrency } from "@/lib/formatters";

type MonthProjectionCardProps = {
  dailyAverage: number;
  projectedMonthTotal: number;
  projectedBudgetDifference: number | null;
};

export function MonthProjectionCard({
  dailyAverage,
  projectedMonthTotal,
  projectedBudgetDifference,
}: MonthProjectionCardProps) {
  const hasBudget = projectedBudgetDifference !== null;
  const isAboveBudget = hasBudget && projectedBudgetDifference > 0;

  return (
    <section className="app-card p-4">
      <div>
        <h2 className="text-base font-bold text-[var(--app-ink)]">
          Projeção do mês
        </h2>
        <p className="mt-1 text-sm text-[var(--app-ink-muted)]">
          Estimativa com base na média diária atual
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="metric-tile">
          <p className="text-xs font-semibold text-[var(--app-ink-muted)]">Média diária</p>
          <strong className="mt-1 block text-lg font-bold text-[var(--app-ink)]">
            {formatCurrency(dailyAverage)}
          </strong>
        </div>
        <div className="metric-tile">
          <p className="text-xs font-semibold text-[var(--app-ink-muted)]">
            Fechamento projetado
          </p>
          <strong className="mt-1 block text-lg font-bold text-[var(--app-ink)]">
            {formatCurrency(projectedMonthTotal)}
          </strong>
        </div>
      </div>

      {hasBudget ? (
        <p
          className={`mt-4 text-sm leading-6 ${
            isAboveBudget ? "text-amber-700" : "text-emerald-700"
          }`}
        >
          {isAboveBudget
            ? `Pode fechar ${formatCurrency(projectedBudgetDifference)} acima da meta.`
            : `Pode fechar ${formatCurrency(Math.abs(projectedBudgetDifference))} abaixo da meta.`}
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Configure uma meta para comparar a projeção com seu limite mensal.
        </p>
      )}
    </section>
  );
}

