import Link from "next/link";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { deleteTransactionAction } from "@/server/transactions/actions";
import { paymentMethodLabels } from "@/server/transactions/labels";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { listTransactionsByMonth } from "@/server/transactions/repository";
import type { TransactionListItem } from "@/server/transactions/types";

export const dynamic = "force-dynamic";

type ExpensesPageProps = {
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

  if (month < 1 || month > 12) {
    return fallback;
  }

  return { month, year, inputValue: value };
}

async function loadTransactions(month: number, year: number): Promise<{
  transactions: TransactionListItem[];
  error: string | null;
}> {
  const userId = await requireCurrentUserId();

  try {
    return {
      transactions: await listTransactionsByMonth(userId, month, year),
      error: null,
    };
  } catch {
    return {
      transactions: [],
      error:
        "Não foi possível carregar os gastos. Verifique a conexão com o banco.",
    };
  }
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const { mes } = await searchParams;
  const { month, year, inputValue } = parseMonthFilter(mes);
  const { transactions, error } = await loadTransactions(month, year);
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] pb-28 md:pb-0">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Gastos</h1>
            <p className="mt-2 text-base leading-7 text-slate-600">
              Movimentações de {formatMonth(new Date(year, month - 1, 1))}.
            </p>
          </div>

          <Link
            href="/novo"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <Plus size={18} aria-hidden="true" />
            Novo gasto
          </Link>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="mes">
                Filtrar por mês
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
              Aplicar filtro
            </button>
          </form>

          <div className="mt-4 rounded-lg bg-slate-950 p-4 text-white">
            <p className="text-sm text-slate-300">Total de despesas no mês</p>
            <strong className="mt-1 block text-2xl font-semibold">
              {formatCurrency(totalExpenses)}
            </strong>
          </div>
        </section>

        {error ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </section>
        ) : null}

        {!error && transactions.length === 0 ? (
          <section className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/70">
            <h2 className="text-base font-semibold text-slate-950">
              Nenhum gasto neste mês
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Cadastre o primeiro gasto para acompanhar melhor o ritmo do mês.
            </p>
            <Link
              href="/novo"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white"
            >
              Salvar gasto
            </Link>
          </section>
        ) : null}

        <section className="space-y-3">
          {transactions.map((transaction) => (
            <article
              key={transaction.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: transaction.categoryColor ?? "#64748b",
                      }}
                    />
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {transaction.description}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {transaction.categoryName} •{" "}
                    {paymentMethodLabels[transaction.paymentMethod]}
                    {transaction.cardName ? ` • ${transaction.cardName}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Intl.DateTimeFormat("pt-BR").format(
                      new Date(`${transaction.date}T00:00:00`),
                    )}
                    {transaction.isInstallment &&
                    transaction.installmentNumber &&
                    transaction.totalInstallments
                      ? ` • ${transaction.installmentNumber}/${transaction.totalInstallments}`
                      : ""}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <strong className="block text-base font-semibold text-slate-950">
                    {formatCurrency(transaction.amount)}
                  </strong>
                  <div className="mt-3 flex justify-end gap-1">
                    <Link
                      href={`/novo?id=${transaction.id}`}
                      className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                      aria-label="Editar transação"
                    >
                      <Edit3 size={17} aria-hidden="true" />
                    </Link>
                    <form action={deleteTransactionAction}>
                      <input type="hidden" name="id" value={transaction.id} />
                      <button
                        type="submit"
                        className="flex size-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50"
                        aria-label="Excluir transação"
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
      <MobileNavigation />
    </div>
  );
}
