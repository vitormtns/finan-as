import type { FinancialAlert } from "@/server/alerts/types";

type AlertsListProps = {
  alerts: FinancialAlert[];
};

const severityStyles = {
  info: "border-blue-100 bg-blue-50 text-blue-700",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  danger: "border-red-100 bg-red-50 text-red-700",
};

export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <section className="app-card p-4">
      <div>
        <h2 className="text-base font-bold text-[var(--app-ink)]">
          Alertas do mês
        </h2>
        <p className="mt-1 text-sm text-[var(--app-ink-muted)]">
          Conselhos gerados por regras simples, sem integração externa.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {alerts.map((alert) => (
          <article
            key={`${alert.type}-${alert.message}`}
            className={`rounded-lg border p-3 ${severityStyles[alert.severity]}`}
          >
            <p className="text-sm font-semibold">{alert.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {alert.message}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

