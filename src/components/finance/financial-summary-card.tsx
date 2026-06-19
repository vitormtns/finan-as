import type { LucideIcon } from "lucide-react";

type FinancialSummaryCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "neutral";
};

const toneStyles = {
  primary: "border-[color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
  success: "border-[color-mix(in_srgb,var(--app-accent)_18%,var(--app-border))] bg-[var(--app-accent-soft)] text-[var(--app-accent)]",
  warning: "border-[color-mix(in_srgb,var(--app-warning)_20%,var(--app-border))] bg-[var(--app-warning-soft)] text-[var(--app-warning)]",
  neutral: "border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-primary)]",
};

export function FinancialSummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "neutral",
}: FinancialSummaryCardProps) {
  return (
    <article className="app-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--app-ink-muted)]">{title}</p>
          <strong className="mt-2 block text-2xl font-bold tracking-normal text-[var(--app-ink)]">
            {value}
          </strong>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${toneStyles[tone]}`}
          aria-hidden="true"
        >
          <Icon size={19} strokeWidth={2.2} />
        </span>
      </div>
      <p className="mt-3 text-sm leading-5 text-[var(--app-ink-muted)]">{description}</p>
    </article>
  );
}
