import { formatCurrency } from "@/lib/formatters";

type MonthProjectionCardProps = {
  dailyAverage: number;
  historicalAverage: number | null;
  historicalMonthsUsed: number;
  projectionConfidence: "learning" | "medium" | "high";
  projectedMonthTotal: number;
  projectedBudgetDifference: number | null;
};

const confidenceLabels = {
  learning: "Aprendendo seu padrão",
  medium: "Confiança moderada",
  high: "Alta confiança",
};

export function MonthProjectionCard({
  dailyAverage,
  historicalAverage,
  historicalMonthsUsed,
  projectionConfidence,
  projectedMonthTotal,
  projectedBudgetDifference,
}: MonthProjectionCardProps) {
  const hasBudget = projectedBudgetDifference !== null;
  const isAboveBudget = hasBudget && projectedBudgetDifference > 0;

  return (
    <section className="app-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
        <h2 className="text-base font-bold text-[var(--app-ink)]">
          Projeção do mês
        </h2>
        <p className="mt-1 text-sm text-[var(--app-ink-muted)]">
          {historicalMonthsUsed > 0
            ? `Combina seu ritmo com ${historicalMonthsUsed} ${historicalMonthsUsed === 1 ? "mês anterior" : "meses anteriores"}`
            : "Estimativa estabilizada enquanto seu histórico é formado"}
        </p>
        </div>
        <span className="rounded-full bg-[var(--app-primary-soft)] px-3 py-1.5 text-[0.68rem] font-extrabold text-[var(--app-primary)]">
          {confidenceLabels[projectionConfidence]}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <div className="metric-tile">
          <p className="text-xs font-semibold text-[var(--app-ink-muted)]">Média atual</p>
          <strong className="mt-1 block text-lg font-bold text-[var(--app-ink)]">
            {formatCurrency(dailyAverage)}
          </strong>
        </div>
        <div className="metric-tile">
          <p className="text-xs font-semibold text-[var(--app-ink-muted)]">Média histórica</p>
          <strong className="mt-1 block text-lg font-bold text-[var(--app-ink)]">
            {historicalAverage === null
              ? "Em formação"
              : formatCurrency(historicalAverage)}
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
            ? `A estimativa aponta ${formatCurrency(projectedBudgetDifference)} acima da meta.`
            : `A estimativa aponta ${formatCurrency(Math.abs(projectedBudgetDifference))} abaixo da meta.`}
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Configure uma meta para comparar a projeção com seu limite mensal.
        </p>
      )}
    </section>
  );
}

