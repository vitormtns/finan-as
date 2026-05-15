import { LogOut } from "lucide-react";
import { logoutAction } from "@/server/auth/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/70 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <LogOut size={16} aria-hidden="true" />
        Sair
      </button>
    </form>
  );
}
