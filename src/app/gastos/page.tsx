import Link from "next/link";
import { Copy, Edit3, Plus, ReceiptText, Trash2 } from "lucide-react";
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
  const expenses = transactions.filter((transaction) => transaction.type === "EXPENSE");
  const totalExpenses = expenses.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  return (
    <div className="app-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-4 sm:px-6 md:py-7">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,#fffdf8,#edf4ee)] p-5 shadow-[0_28px_70px_rgb(16_25_35_/_0.1)]">
          <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative grid gap-5 md:grid-cols-[1fr_0.72fr] md:items-end">
            <div>
              <span className="app-kicker">
                <ReceiptText size={16} aria-hidden="true" />
                {formatMonth(new Date(year, month - 1, 1))}
              </span>
              <h1 className="mt-5 app-title">Gastos</h1>
              <p className="app-subtitle mt-2 max-w-xl">
                Movimentações organizadas por mês, com ações rápidas para manter
                o controle no ritmo do dia a dia.
              </p>
            </div>

            <div className="rounded-[1.45rem] bg-[var(--app-primary)] p-4 text-white shadow-[0_18px_42px_rgb(15_38_51_/_0.22)]">
              <p className="text-sm font-semibold text-white/58">
                Total de despesas
              </p>
              <strong className="mt-2 block text-4xl font-bold tracking-normal">
                {formatCurrency(totalExpenses)}
              </strong>
              <Link href="/novo" className="mt-5 flex min-h-12 items-center justify-between rounded-2xl bg-white px-4 text-sm font-bold text-[var(--app-primary)]">
                <span className="inline-flex items-center gap-2">
                  <Plus size={18} aria-hidden="true" />
                  Novo gasto
                </span>
                <span aria-hidden="true">+</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[1.45rem] border border-white/70 bg-white/68 p-4 shadow-[0_18px_48px_rgb(16_25_35_/_0.08)] backdrop-blur">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label className="form-label" htmlFor="mes">
                Filtrar por mês
              </label>
              <input
                id="mes"
                name="mes"
                type="month"
                defaultValue={inputValue}
                className="form-control mt-2 min-h-11 sm:max-w-xs"
              />
            </div>
            <button type="submit" className="btn-secondary min-h-11">
              Aplicar filtro
            </button>
          </form>
        </section>

        {error ? (
          <section className="alert-danger p-4 text-sm">{error}</section>
        ) : null}

        {!error && transactions.length === 0 ? (
          <section className="rounded-[1.65rem] border border-dashed border-[var(--app-border-strong)] bg-white/64 p-8 text-center shadow-[0_18px_48px_rgb(16_25_35_/_0.08)] backdrop-blur">
            <h2 className="text-lg font-bold text-[var(--app-ink)]">
              Nenhum gasto neste mês
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--app-ink-muted)]">
              Cadastre o primeiro gasto para acompanhar melhor o ritmo do mês.
            </p>
            <Link href="/novo" className="btn-primary mt-5">
              Salvar gasto
            </Link>
          </section>
        ) : null}

        <section className="rounded-[1.65rem] border border-white/70 bg-white/58 p-3 shadow-[0_20px_55px_rgb(16_25_35_/_0.08)] backdrop-blur">
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <article
                key={transaction.id}
                className="rounded-[1.25rem] bg-white/78 p-4 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.75)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span
                        className="size-10 shrink-0 rounded-2xl shadow-inner"
                        style={{
                          backgroundColor: transaction.categoryColor ?? "#64748b",
                        }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[var(--app-ink)]">
                          {transaction.description}
                        </p>
                        <p className="mt-1 text-xs text-[var(--app-ink-muted)]">
                          {transaction.categoryName} •{" "}
                          {paymentMethodLabels[transaction.paymentMethod]}
                          {transaction.cardName ? ` • ${transaction.cardName}` : ""}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-[var(--app-ink-muted)]">
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
                    <strong className="block text-base font-bold text-[var(--app-ink)]">
                      {formatCurrency(transaction.amount)}
                    </strong>
                    <div className="mt-3 flex justify-end gap-1">
                      <Link
                        href={`/novo?duplicar=${transaction.id}`}
                        className="icon-button size-9 rounded-full"
                        aria-label="Duplicar gasto"
                      >
                        <Copy size={16} aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/novo?id=${transaction.id}`}
                        className="icon-button size-9 rounded-full"
                        aria-label="Editar transação"
                      >
                        <Edit3 size={16} aria-hidden="true" />
                      </Link>
                      <form action={deleteTransactionAction}>
                        <input type="hidden" name="id" value={transaction.id} />
                        <button
                          type="submit"
                          className="btn-danger size-9 rounded-full"
                          aria-label="Excluir transação"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <MobileNavigation />
    </div>
  );
}
