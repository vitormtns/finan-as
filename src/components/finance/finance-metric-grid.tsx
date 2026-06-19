import type { LucideIcon } from "lucide-react";

type FinanceMetric = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: "ink" | "emerald" | "warm" | "muted";
  featured?: boolean;
};

type FinanceMetricGridProps = {
  metrics: FinanceMetric[];
};

const toneStyles = {
  ink: "from-[#132f3d] to-[#0f1923] text-white",
  emerald: "from-[#ecf8f1] to-[#dcefe6] text-[var(--app-ink)]",
  warm: "from-[#fff7e6] to-[#f4e7cf] text-[var(--app-ink)]",
  muted: "from-[#ffffff] to-[#eee9df] text-[var(--app-ink)]",
};

const iconStyles = {
  ink: "bg-white/12 text-white",
  emerald: "bg-white/70 text-[var(--app-accent)]",
  warm: "bg-white/70 text-[var(--app-warning)]",
  muted: "bg-white/80 text-[var(--app-primary)]",
};

export function FinanceMetricGrid({ metrics }: FinanceMetricGridProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const tone = metric.tone ?? "muted";
        const Icon = metric.icon;

        return (
          <article
            key={metric.title}
            className={`relative overflow-hidden rounded-[1.35rem] border border-white/70 bg-gradient-to-br p-4 shadow-[0_18px_42px_rgb(16_25_35_/_0.08)] ${
              toneStyles[tone]
            } ${metric.featured ? "min-h-48 sm:col-span-2 lg:col-span-2" : "min-h-40"}`}
          >
            <div className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-white/25 blur-2xl" />
            <div className="relative flex h-full flex-col justify-between gap-5">
              <div className="flex items-start justify-between gap-3">
                <p
                  className={`text-sm font-semibold ${
                    tone === "ink" ? "text-white/68" : "text-[var(--app-ink-muted)]"
                  }`}
                >
                  {metric.title}
                </p>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${iconStyles[tone]}`}
                  aria-hidden="true"
                >
                  <Icon size={17} strokeWidth={2.15} />
                </span>
              </div>

              <div>
                <strong
                  className={`block font-bold tracking-normal ${
                    metric.featured ? "text-3xl" : "text-2xl"
                  }`}
                >
                  {metric.value}
                </strong>
                <p
                  className={`mt-2 text-sm leading-5 ${
                    tone === "ink" ? "text-white/72" : "text-[var(--app-ink-muted)]"
                  }`}
                >
                  {metric.description}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
