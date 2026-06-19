import { Plus } from "lucide-react";
import Link from "next/link";

export function AddExpenseButton() {
  return (
    <Link
      href="/novo"
      className="btn-primary w-full sm:w-auto"
      aria-label="Adicionar novo gasto"
    >
      <Plus size={19} strokeWidth={2.4} aria-hidden="true" />
      Adicionar gasto
    </Link>
  );
}
