import type { LucideIcon } from "lucide-react";

type FinancialSummaryCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "neutral";
};

const toneStyles = {
  primary: "border-blue-100 bg-blue-50 text-blue-700",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  neutral: "border-slate-200 bg-white text-slate-700",
};

export function FinancialSummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "neutral",
}: FinancialSummaryCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <strong className="mt-2 block text-2xl font-semibold text-slate-950">
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
      <p className="mt-3 text-sm leading-5 text-slate-500">{description}</p>
    </article>
  );
}
