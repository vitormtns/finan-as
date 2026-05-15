import { Plus } from "lucide-react";
import Link from "next/link";

export function AddExpenseButton() {
  return (
    <Link
      href="/novo"
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto"
      aria-label="Adicionar novo gasto"
    >
      <Plus size={19} strokeWidth={2.4} aria-hidden="true" />
      Adicionar gasto
    </Link>
  );
}
