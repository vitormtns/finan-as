import { BellRing } from "lucide-react";
import { AlertsList } from "@/components/finance/alerts-list";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { formatMonth } from "@/lib/formatters";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { generateFinancialAlerts } from "@/server/alerts/service";
import type { FinancialAlert } from "@/server/alerts/types";

export const dynamic = "force-dynamic";

async function loadAlerts(): Promise<{
  alerts: FinancialAlert[];
  error: string | null;
}> {
  const userId = await requireCurrentUserId();

  try {
    return {
      alerts: await generateFinancialAlerts(userId),
      error: null,
    };
  } catch {
    return {
      alerts: [],
      error:
        "Não foi possível carregar os alertas. Verifique a conexão com o banco.",
    };
  }
}

export default async function AlertsPage() {
  const { alerts, error } = await loadAlerts();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] pb-28 md:pb-0">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-100/70">
            <BellRing size={16} aria-hidden="true" />
            {formatMonth(new Date())}
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">
            Alertas
          </h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
            Sinais simples para ajudar você a decidir onde ajustar o ritmo.
          </p>
        </header>

        {error ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </section>
        ) : (
          <AlertsList alerts={alerts} />
        )}
      </main>
      <MobileNavigation />
    </div>
  );
}
