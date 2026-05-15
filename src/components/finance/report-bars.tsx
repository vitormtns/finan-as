import { formatCurrency } from "@/lib/formatters";
import type { ReportBreakdownItem } from "@/server/reports/types";

type ReportBarsProps = {
  title: string;
  subtitle: string;
  items: ReportBreakdownItem[];
};

export function ReportBars({ title, subtitle, items }: ReportBarsProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
      <div>
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
          Nenhum dado para este mês.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.key}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color ?? "#2563eb" }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm font-medium text-slate-700">
                    {item.label}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <strong className="block text-sm font-semibold text-slate-950">
                    {formatCurrency(item.amount)}
                  </strong>
                  <span className="text-xs text-slate-500">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.min(item.percentage, 100)}%`,
                    backgroundColor: item.color ?? "#2563eb",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
