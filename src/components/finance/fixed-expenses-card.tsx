import { formatCurrency } from "@/lib/formatters";
import type { RemainingFixedExpense } from "@/server/dashboard/types";

type FixedExpensesCardProps = {
  expenses: RemainingFixedExpense[];
  total: number;
};

export function FixedExpensesCard({ expenses, total }: FixedExpensesCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
      <div>
        <h2 className="text-base font-semibold text-slate-950">
          Fixos restantes
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Estimativa do que ainda deve cair neste mês
        </p>
      </div>

      {expenses.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
          Nenhum gasto fixo restante para este mês.
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
                <p className="mt-1 text-xs text-slate-500">
                  {expense.categoryName} • vence dia {expense.dueDay}
                </p>
              </div>
              <strong className="shrink-0 text-sm font-semibold text-slate-950">
                {formatCurrency(expense.amount)}
              </strong>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-lg bg-slate-50 p-3">
        <p className="text-xs font-medium text-slate-500">Total estimado</p>
        <strong className="mt-1 block text-lg font-semibold text-slate-950">
          {formatCurrency(total)}
        </strong>
      </div>
    </section>
  );
}
