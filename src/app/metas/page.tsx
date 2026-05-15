import { CalendarDays } from "lucide-react";
import { GoalsForm } from "@/components/finance/goals-form";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { getGoalsPageData } from "@/server/goals/service";
import type { GoalsPageData } from "@/server/goals/types";

export const dynamic = "force-dynamic";

type GoalsPageProps = {
  searchParams: Promise<{
    mes?: string;
  }>;
};

function parseMonthFilter(value?: string) {
  const now = new Date();
  const fallback = {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    inputValue: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  };

  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return fallback;
  }

  const [year, month] = value.split("-").map(Number);

  if (month < 1 || month > 12 || year < 2020 || year > 2100) {
    return fallback;
  }

  return { month, year, inputValue: value };
}

async function loadGoals(month: number, year: number): Promise<{
  goals: GoalsPageData | null;
  error: string | null;
}> {
  const userId = await requireCurrentUserId();

  try {
    return {
      goals: await getGoalsPageData(userId, month, year),
      error: null,
    };
  } catch {
    return {
      goals: null,
      error:
        "Não foi possível carregar as metas. Verifique a conexão com o banco.",
    };
  }
}

export default async function GoalsPage({ searchParams }: GoalsPageProps) {
  const { mes } = await searchParams;
  const { month, year, inputValue } = parseMonthFilter(mes);
  const { goals, error } = await loadGoals(month, year);
  const difference = goals?.difference ?? null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] pb-28 md:pb-0">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-100/70">
            <CalendarDays size={16} aria-hidden="true" />
            {formatMonth(new Date(year, month - 1, 1))}
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Metas</h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
            Configure seus limites do mês sem transformar a rotina em planilha.
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="mes">
                Selecionar mês e ano
              </label>
              <input
                id="mes"
                name="mes"
                type="month"
                defaultValue={inputValue}
                className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:w-48"
              />
            </div>
            <button
              type="submit"
              className="min-h-11 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Carregar metas
            </button>
          </form>
        </section>

        {error ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </section>
        ) : null}

        {goals ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                <p className="text-sm font-medium text-slate-500">
                  Meta mensal geral
                </p>
                <strong className="mt-2 block text-2xl font-semibold text-slate-950">
                  {goals.totalLimit === null
                    ? "Não definida"
                    : formatCurrency(goals.totalLimit)}
                </strong>
              </article>

              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                <p className="text-sm font-medium text-slate-500">
                  Soma das categorias
                </p>
                <strong className="mt-2 block text-2xl font-semibold text-slate-950">
                  {formatCurrency(goals.totalCategoryLimits)}
                </strong>
              </article>

              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                <p className="text-sm font-medium text-slate-500">Diferença</p>
                <strong
                  className={`mt-2 block text-2xl font-semibold ${
                    difference !== null && difference < 0
                      ? "text-red-600"
                      : "text-slate-950"
                  }`}
                >
                  {difference === null ? "Sem meta" : formatCurrency(difference)}
                </strong>
                <p className="mt-2 text-sm text-slate-500">
                  {difference === null
                    ? "Defina a meta mensal para comparar."
                    : difference < 0
                      ? "Categorias acima da meta geral."
                      : "Margem restante da meta geral."}
                </p>
              </article>
            </section>

            {goals.categories.length === 0 ? (
              <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                Nenhuma categoria de despesa encontrada. Rode o seed inicial ou
                cadastre categorias antes de configurar metas.
              </section>
            ) : (
              <GoalsForm goals={goals} />
            )}
          </>
        ) : null}
      </main>
      <MobileNavigation />
    </div>
  );
}
