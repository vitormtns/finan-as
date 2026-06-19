import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { WeeklySummary } from "@/server/dashboard/types";

type WeeklySummaryCardProps = {
  summary: WeeklySummary;
};

function getComparisonText(summary: WeeklySummary) {
  if (
    summary.comparisonTrend === "none" ||
    summary.comparisonAmount === null ||
    summary.comparisonPercentage === null
  ) {
    return "Ainda não há dados da semana anterior para comparar.";
  }

  if (summary.comparisonTrend === "same") {
    return "Seu gasto está igual ao da semana anterior.";
  }

  const amount = formatCurrency(Math.abs(summary.comparisonAmount));
  const percentage = Math.abs(summary.comparisonPercentage);

  if (summary.comparisonTrend === "up") {
    return `${amount} acima da semana anterior (${percentage}%).`;
  }

  return `${amount} abaixo da semana anterior (${percentage}%).`;
}

export function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
  const isAbovePreviousWeek = summary.comparisonTrend === "up";
  const ComparisonIcon = isAbovePreviousWeek ? TrendingUp : TrendingDown;

  return (
    <section className="app-card p-4">
      <div>
        <h2 className="text-base font-bold text-[var(--app-ink)]">Esta semana</h2>
        <p className="mt-1 text-sm text-[var(--app-ink-muted)]">
          Ritmo dos gastos desde segunda-feira.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="metric-tile">
          <p className="text-xs font-semibold text-[var(--app-ink-muted)]">Total gasto</p>
          <strong className="mt-1 block text-lg font-bold text-[var(--app-ink)]">
            {formatCurrency(summary.totalExpenses)}
          </strong>
        </div>
        <div className="metric-tile">
          <p className="text-xs font-semibold text-[var(--app-ink-muted)]">Média diária</p>
          <strong className="mt-1 block text-lg font-bold text-[var(--app-ink)]">
            {formatCurrency(summary.dailyAverage)}
          </strong>
        </div>
        <div className="metric-tile">
          <p className="text-xs font-semibold text-[var(--app-ink-muted)]">Maior peso</p>
          <strong className="mt-1 block truncate text-lg font-bold text-[var(--app-ink)]">
            {summary.topCategoryName ?? "Sem gastos"}
          </strong>
          {summary.topCategoryName ? (
            <span className="mt-1 block text-xs text-[var(--app-ink-muted)]">
              {formatCurrency(summary.topCategoryAmount)}
            </span>
          ) : null}
        </div>
      </div>

      <div
        className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm leading-6 ${
          isAbovePreviousWeek
            ? "border-amber-100 bg-amber-50 text-amber-700"
            : "border-emerald-100 bg-emerald-50 text-emerald-700"
        }`}
      >
        <ComparisonIcon className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
        <p>{getComparisonText(summary)}</p>
      </div>
    </section>
  );
}

