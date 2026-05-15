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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] pb-28 md:pb-0">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-100/70">
            <BarChart3 size={16} aria-hidden="true" />
            {formatMonth(new Date(year, month - 1, 1))}
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">
            Relatórios
          </h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
            Uma leitura simples para entender onde o dinheiro está indo.
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
              Atualizar relatório
            </button>
          </form>
        </section>

        {error ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </section>
        ) : null}

        {report ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                <p className="text-sm font-medium text-slate-500">
                  Despesas
                </p>
                <strong className="mt-2 block text-2xl font-semibold text-slate-950">
                  {formatCurrency(report.totalExpenses)}
                </strong>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                <p className="text-sm font-medium text-slate-500">Receitas</p>
                <strong className="mt-2 block text-2xl font-semibold text-slate-950">
                  {formatCurrency(report.totalIncome)}
                </strong>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                <p className="text-sm font-medium text-slate-500">Saldo</p>
                <strong
                  className={`mt-2 block text-2xl font-semibold ${
                    report.balance < 0 ? "text-red-600" : "text-slate-950"
                  }`}
                >
                  {formatCurrency(report.balance)}
                </strong>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                <p className="text-sm font-medium text-slate-500">
                  Comparativo
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {report.comparison.trend === "up" ? (
                    <TrendingUp className="text-red-500" size={20} />
                  ) : (
                    <TrendingDown className="text-emerald-600" size={20} />
                  )}
                  <strong className="text-lg font-semibold text-slate-950">
                    {formatCurrency(Math.abs(report.comparison.differenceAmount))}
                  </strong>
                </div>
                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {comparisonText(report)}
                </p>
              </article>
            </section>

            {!report.hasData ? (
              <section className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/70">
                <h2 className="text-base font-semibold text-slate-950">
                  Sem dados neste mês
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
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
