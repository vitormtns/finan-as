import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { ReportBars } from "@/components/finance/report-bars";
import { TopExpensesList } from "@/components/finance/top-expenses-list";
import { formatCurrency, formatMonth, parseMonthFilter } from "@/lib/formatters";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { getMonthlyReport } from "@/server/reports/service";
import type { MonthlyReport } from "@/server/reports/types";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  searchParams: Promise<{
    mes?: string;
  }>;
};

async function loadReport(month: number, year: number): Promise<{
  report: MonthlyReport | null;
  error: string | null;
}> {
  const userId = await requireCurrentUserId();

  try {
    return {
      report: await getMonthlyReport(userId, month, year),
      error: null,
    };
  } catch {
    return {
      report: null,
      error:
        "Não foi possível carregar os relatórios. Verifique a conexão com o banco.",
    };
  }
}

function comparisonText(report: MonthlyReport) {
  const { comparison } = report;

  if (comparison.previousMonthExpenses === 0) {
    return "Sem despesas no mês anterior para comparar.";
  }

  if (comparison.trend === "same") {
    return "Despesas iguais ao mês anterior.";
  }

  const direction =
    comparison.trend === "up" ? "a mais que" : "a menos que";

  return `${formatCurrency(Math.abs(comparison.differenceAmount))} ${direction} o mês anterior${
    comparison.differencePercentage !== null
      ? ` (${Math.abs(comparison.differencePercentage)}%)`
      : ""
  }.`;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { mes } = await searchParams;
  const { month, year, inputValue } = parseMonthFilter(mes);
  const { report, error } = await loadReport(month, year);

  return (
    <div className="app-shell">
      <main className="flex w-full max-w-none flex-col gap-5 px-0 py-5 sm:px-5 md:py-8 lg:px-6 xl:px-8">
        <header className="premium-page-hero">
          <div className="relative">
          <div className="app-kicker">
            <BarChart3 size={16} aria-hidden="true" />
            {formatMonth(new Date(year, month - 1, 1))}
          </div>
          <h1 className="mt-4 app-title">
            Relatórios
          </h1>
          <p className="app-subtitle mt-2 max-w-xl">
            Tendências e comparações para entender seu dinheiro sem planilhas.
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
              Atualizar relatório
            </button>
          </form>
        </section>

        {error ? (
          <section className="alert-danger p-4 text-sm">
            {error}
          </section>
        ) : null}

        {report ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">
                  Despesas
                </p>
                <strong className="mt-2 block text-2xl font-bold text-[var(--app-ink)]">
                  {formatCurrency(report.totalExpenses)}
                </strong>
              </article>
              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">Receitas</p>
                <strong className="mt-2 block text-2xl font-bold text-[var(--app-ink)]">
                  {formatCurrency(report.totalIncome)}
                </strong>
              </article>
              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">Saldo</p>
                <strong
                  className={`mt-2 block text-2xl font-bold ${
                    report.balance < 0 ? "text-red-600" : "text-slate-950"
                  }`}
                >
                  {formatCurrency(report.balance)}
                </strong>
              </article>
              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">
                  Comparativo
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {report.comparison.trend === "up" ? (
                    <TrendingUp className="text-red-500" size={20} />
                  ) : (
                    <TrendingDown className="text-emerald-600" size={20} />
                  )}
                  <strong className="text-lg font-bold text-[var(--app-ink)]">
                    {formatCurrency(Math.abs(report.comparison.differenceAmount))}
                  </strong>
                </div>
                <p className="mt-2 text-sm leading-5 text-[var(--app-ink-muted)]">
                  {comparisonText(report)}
                </p>
              </article>
            </section>

            {!report.hasData ? (
              <section className="app-card border-dashed p-6 text-center">
                <h2 className="text-base font-bold text-[var(--app-ink)]">
                  Sem dados neste mês
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--app-ink-muted)]">
                  Cadastre transações para ver categorias, formas de pagamento e
                  maiores gastos.
                </p>
              </section>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <ReportBars
                title="Gastos por categoria"
                subtitle="Onde você mais gastou no mês selecionado"
                items={report.categoryBreakdown}
              />
              <ReportBars
                title="Forma de pagamento"
                subtitle="Como as despesas foram pagas"
                items={report.paymentMethodBreakdown}
              />
            </div>

            <TopExpensesList expenses={report.topExpenses} />
          </>
        ) : null}
      </main>
      <MobileNavigation />
    </div>
  );
}
