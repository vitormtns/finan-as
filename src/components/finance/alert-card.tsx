import { AlertTriangle } from "lucide-react";

type AlertCardProps = {
  title: string;
  description: string;
  status: string;
  tone?: "info" | "success" | "warning" | "danger";
};

const toneStyles = {
  info: {
    section: "border-[color-mix(in_srgb,var(--app-primary)_18%,var(--app-border))] bg-[var(--app-primary-soft)]",
    icon: "bg-[var(--app-primary)]",
    status: "text-[var(--app-primary)]",
  },
  success: {
    section: "border-[color-mix(in_srgb,var(--app-accent)_18%,var(--app-border))] bg-[var(--app-accent-soft)]",
    icon: "bg-[var(--app-accent)]",
    status: "text-[var(--app-accent)]",
  },
  warning: {
    section: "border-[color-mix(in_srgb,var(--app-warning)_22%,var(--app-border))] bg-[var(--app-warning-soft)]",
    icon: "bg-[var(--app-warning)]",
    status: "text-[var(--app-warning)]",
  },
  danger: {
    section: "border-[color-mix(in_srgb,var(--app-danger)_18%,var(--app-border))] bg-[var(--app-danger-soft)]",
    icon: "bg-[var(--app-danger)]",
    status: "text-[var(--app-danger)]",
  },
};

export function AlertCard({
  title,
  description,
  status,
  tone = "warning",
}: AlertCardProps) {
  const styles = toneStyles[tone];

  return (
    <section className={`rounded-lg border p-4 shadow-sm ${styles.section}`}>
      <div className="flex items-start gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-white ${styles.icon}`}
          aria-hidden="true"
        >
          <AlertTriangle size={20} strokeWidth={2.3} />
        </span>
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase ${styles.status}`}>
            {status}
          </p>
          <h2 className="mt-1 text-base font-bold text-[var(--app-ink)]">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-5 text-[var(--app-ink-muted)]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
