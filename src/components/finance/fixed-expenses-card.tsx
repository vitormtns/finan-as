import { formatCurrency } from "@/lib/formatters";
import type { RemainingFixedExpense } from "@/server/dashboard/types";

type FixedExpensesCardProps = {
  expenses: RemainingFixedExpense[];
  total: number;
};

export function FixedExpensesCard({ expenses, total }: FixedExpensesCardProps) {
  return (
    <section className="app-card p-4">
      <div>
        <h2 className="text-base font-bold text-[var(--app-ink)]">
          Fixos restantes
        </h2>
        <p className="mt-1 text-sm text-[var(--app-ink-muted)]">
          Gastos fixos do mês que ainda não foram pagos
        </p>
      </div>

      {expenses.length === 0 ? (
        <div className="mt-5 empty-state text-sm leading-6">
          Nenhum gasto fixo pendente para este mês.
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-100">
          {expenses.map((expense) => (
            <div
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              key={expense.id}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {expense.description}
                </p>
                <p className="mt-1 text-xs text-[var(--app-ink-muted)]">
                  {expense.categoryName} •{" "}
                  {expense.status === "overdue" ? "vencido" : "vence"} dia{" "}
                  {expense.dueDay}
                </p>
              </div>
              <strong className="shrink-0 text-sm font-semibold text-slate-950">
                {formatCurrency(expense.amount)}
              </strong>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 metric-tile">
        <p className="text-xs font-semibold text-[var(--app-ink-muted)]">Total estimado</p>
        <strong className="mt-1 block text-lg font-bold text-[var(--app-ink)]">
          {formatCurrency(total)}
        </strong>
      </div>
    </section>
  );
}

