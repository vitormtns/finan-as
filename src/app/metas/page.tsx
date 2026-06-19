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
    <div className="app-shell">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header className="premium-page-hero">
          <div className="relative">
          <div className="app-kicker">
            <CalendarDays size={16} aria-hidden="true" />
            {formatMonth(new Date(year, month - 1, 1))}
          </div>
          <h1 className="mt-4 app-title">Metas</h1>
          <p className="app-subtitle mt-2 max-w-xl">
            Configure seus limites do mês sem transformar a rotina em planilha.
          </p>
          </div>
        </header>

        <section className="premium-panel p-4">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="form-label" htmlFor="mes">
                Selecionar mês e ano
              </label>
              <input
                id="mes"
                name="mes"
                type="month"
                defaultValue={inputValue}
                className="form-control mt-2 min-h-11 sm:w-48"
              />
            </div>
            <button
              type="submit"
              className="btn-secondary min-h-11"
            >
              Carregar metas
            </button>
          </form>
        </section>

        {error ? (
          <section className="alert-danger p-4 text-sm">
            {error}
          </section>
        ) : null}

        {goals ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">
                  Meta mensal geral
                </p>
                <strong className="mt-2 block text-2xl font-bold text-[var(--app-ink)]">
                  {goals.totalLimit === null
                    ? "Não definida"
                    : formatCurrency(goals.totalLimit)}
                </strong>
              </article>

              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">
                  Soma das categorias
                </p>
                <strong className="mt-2 block text-2xl font-bold text-[var(--app-ink)]">
                  {formatCurrency(goals.totalCategoryLimits)}
                </strong>
              </article>

              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">Diferença</p>
                <strong
                  className={`mt-2 block text-2xl font-semibold ${
                    difference !== null && difference < 0
                      ? "text-red-600"
                      : "text-slate-950"
                  }`}
                >
                  {difference === null ? "Sem meta" : formatCurrency(difference)}
                </strong>
                <p className="mt-2 text-sm text-[var(--app-ink-muted)]">
                  {difference === null
                    ? "Defina a meta mensal para comparar."
                    : difference < 0
                      ? "Categorias acima da meta geral."
                      : "Margem restante da meta geral."}
                </p>
              </article>
            </section>

            {goals.categories.length === 0 ? (
              <section className="alert-warning p-4 text-sm leading-6">
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

