import { AlertTriangle } from "lucide-react";

type AlertCardProps = {
  title: string;
  description: string;
  status: string;
  tone?: "info" | "success" | "warning" | "danger";
};

const toneStyles = {
  info: {
    section: "border-blue-200 bg-blue-50 shadow-blue-100/70",
    icon: "bg-blue-600",
    status: "text-blue-700",
  },
  success: {
    section: "border-emerald-200 bg-emerald-50 shadow-emerald-100/70",
    icon: "bg-emerald-600",
    status: "text-emerald-700",
  },
  warning: {
    section: "border-amber-200 bg-amber-50 shadow-amber-100/70",
    icon: "bg-amber-500",
    status: "text-amber-700",
  },
  danger: {
    section: "border-red-200 bg-red-50 shadow-red-100/70",
    icon: "bg-red-600",
    status: "text-red-700",
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
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-700">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
