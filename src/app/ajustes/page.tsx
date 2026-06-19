import Link from "next/link";
import {
  CalendarClock,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Edit3,
  Layers3,
  Pause,
  Play,
  ReceiptText,
  Trash2,
} from "lucide-react";
import { FixedExpenseForm } from "@/components/finance/fixed-expense-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { formatCurrency } from "@/lib/formatters";
import { requireCurrentUserId } from "@/server/auth/current-user";
import {
  deleteFixedExpenseAction,
  launchFixedExpensePaymentAction,
  toggleFixedExpenseAction,
} from "@/server/fixed-expenses/actions";
import {
  getEditableFixedExpense,
  getFixedExpensesPageData,
} from "@/server/fixed-expenses/service";
import type {
  EditableFixedExpense,
  FixedExpensesPageData,
} from "@/server/fixed-expenses/types";
import { paymentMethodLabels } from "@/server/transactions/labels";

export const dynamic = "force-dynamic";

type SettingsPageProps = {
  searchParams: Promise<{
    editar?: string;
  }>;
};

async function loadPageData(id?: string): Promise<{
  data: FixedExpensesPageData | null;
  editableExpense: EditableFixedExpense | null;
  error: string | null;
}> {
  const userId = await requireCurrentUserId();

  try {
    const [data, editableExpense] = await Promise.all([
      getFixedExpensesPageData(userId),
      id ? getEditableFixedExpense(userId, id) : Promise.resolve(null),
    ]);

    return { data, editableExpense, error: null };
  } catch {
    return {
      data: null,
      editableExpense: null,
      error:
        "Não foi possível carregar os gastos fixos. Verifique a conexão com o banco.",
    };
  }
}

function statusLabel(status: "pending" | "paid" | "overdue" | "inactive") {
  if (status === "inactive") {
    return "Inativo";
  }

  if (status === "paid") {
    return "Pago";
  }

  if (status === "overdue") {
    return "Vencido";
  }

  return "Pendente";
}

function statusClasses(status: "pending" | "paid" | "overdue" | "inactive") {
  if (status === "inactive") {
    return "bg-slate-100 text-slate-500";
  }

  if (status === "paid") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "overdue") {
    return "bg-red-50 text-red-600";
  }

  return "bg-blue-50 text-blue-700";
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { editar } = await searchParams;
  const { data, editableExpense, error } = await loadPageData(editar);
  const isEditing = Boolean(editar);

  return (
    <div className="app-shell">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header className="premium-page-hero">
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="app-kicker">
              <CalendarClock size={16} aria-hidden="true" />
              Ajustes financeiros
            </div>
            <h1 className="mt-4 app-title">
              Gastos fixos
            </h1>
            <p className="app-subtitle mt-2 max-w-xl">
              Controle cobranças recorrentes como internet, academia,
              assinaturas e celular.
            </p>
          </div>
          <LogoutButton />
          </div>
        </header>

        {error ? (
          <section className="alert-danger p-4 text-sm">
            {error}
          </section>
        ) : null}

        {data ? (
          <>
            <section className="premium-panel p-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"
                    aria-hidden="true"
                  >
                    <CreditCard size={20} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[var(--app-ink)]">
                      Cartões manuais
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Gerencie limites, fechamento e fatura estimada dos cartões.
                    </p>
                  </div>
                  <Link
                    href="/cartoes"
                    className="btn-primary ml-auto hidden min-h-10 sm:inline-flex"
                  >
                    Abrir cartões
                  </Link>
                </div>

                <div className="flex items-start gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"
                    aria-hidden="true"
                  >
                    <Layers3 size={20} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[var(--app-ink)]">
                      Categorias
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Personalize grupos de despesas e receitas.
                    </p>
                  </div>
                  <Link
                    href="/categorias"
                    className="btn-primary ml-auto hidden min-h-10 sm:inline-flex"
                  >
                    Abrir categorias
                  </Link>
                </div>
                <div className="grid gap-2 sm:hidden">
                  <Link
                    href="/cartoes"
                    className="btn-primary min-h-10"
                  >
                    Abrir cartões
                  </Link>
                  <Link
                    href="/categorias"
                    className="btn-primary min-h-10"
                  >
                    Abrir categorias
                  </Link>
                </div>
                <div className="flex items-start gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700"
                    aria-hidden="true"
                  >
                    <BarChart3 size={20} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[var(--app-ink)]">
                      Relatórios
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Veja categorias, formas de pagamento e comparativos.
                    </p>
                  </div>
                  <Link
                    href="/relatorios"
                    className="btn-primary ml-auto hidden min-h-10 sm:inline-flex"
                  >
                    Abrir relatórios
                  </Link>
                </div>
                <Link
                  href="/relatorios"
                  className="btn-primary min-h-10 sm:hidden"
                >
                  Abrir relatórios
                </Link>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">
                  Total ativo mensal
                </p>
                <strong className="mt-2 block text-2xl font-bold text-[var(--app-ink)]">
                  {formatCurrency(data.summary.activeMonthlyTotal)}
                </strong>
              </article>

              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">
                  Próximos vencimentos
                </p>
                <strong className="mt-2 block text-2xl font-bold text-[var(--app-ink)]">
                  {formatCurrency(data.summary.pendingTotal)}
                </strong>
                <p className="mt-2 text-sm text-[var(--app-ink-muted)]">
                  {data.summary.pendingCount} item(ns) pendente(s)
                </p>
              </article>

              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">
                  Vencidos no mês
                </p>
                <strong className="mt-2 block text-2xl font-bold text-[var(--app-ink)]">
                  {formatCurrency(data.summary.overdueTotal)}
                </strong>
                <p className="mt-2 text-sm text-[var(--app-ink-muted)]">
                  {data.summary.overdueCount} item(ns) já passaram
                </p>
              </article>

              <article className="app-card p-4">
                <p className="text-sm font-semibold text-[var(--app-ink-muted)]">
                  Pagos no mês
                </p>
                <strong className="mt-2 block text-2xl font-bold text-[var(--app-ink)]">
                  {formatCurrency(data.summary.paidTotal)}
                </strong>
                <p className="mt-2 text-sm text-[var(--app-ink-muted)]">
                  {data.summary.paidCount} item(ns) confirmado(s)
                </p>
              </article>
            </section>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <section>
                <div className="mb-3">
                  <h2 className="text-base font-bold text-[var(--app-ink)]">
                    {isEditing ? "Editar gasto fixo" : "Novo gasto fixo"}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--app-ink-muted)]">
                    Mantenha a lista enxuta para a dashboard ficar precisa.
                  </p>
                </div>

                {isEditing && !editableExpense ? (
                  <div className="alert-warning p-4 text-sm">
                    Gasto fixo não encontrado para edição.
                  </div>
                ) : (
                  <FixedExpenseForm
                    options={data.options}
                    initialExpense={editableExpense}
                  />
                )}
              </section>

              <section className="space-y-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--app-ink)]">
                    Recorrências cadastradas
                  </h2>
                  <p className="mt-1 text-sm text-[var(--app-ink-muted)]">
                    Ativos e inativos aparecem juntos para facilitar ajustes.
                  </p>
                </div>

                {data.expenses.length === 0 ? (
                  <div className="app-card p-6 text-center">
                    <h3 className="text-base font-bold text-[var(--app-ink)]">
                      Nenhum gasto fixo cadastrado
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Cadastre cobranças recorrentes para antecipar o impacto no
                      mês.
                    </p>
                  </div>
                ) : null}

                {data.expenses.map((expense) => (
                  <article
                    key={expense.id}
                    className="app-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                expense.categoryColor ?? "#64748b",
                            }}
                          />
                          <h3 className="truncate text-sm font-semibold text-slate-950">
                            {expense.description}
                          </h3>
                        </div>
                        <p className="mt-1 text-xs text-[var(--app-ink-muted)]">
                          {expense.categoryName} •{" "}
                          {paymentMethodLabels[expense.paymentMethod]}
                          {expense.cardName ? ` • ${expense.cardName}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-[var(--app-ink-muted)]">
                          Vence dia {expense.dueDay}
                        </p>
                        {expense.paidAt ? (
                          <p className="mt-1 text-xs text-emerald-700">
                            Pago em{" "}
                            {new Intl.DateTimeFormat("pt-BR").format(
                              new Date(`${expense.paidAt}T00:00:00`),
                            )}
                            {expense.paymentTransactionId
                              ? " • transação lançada"
                              : ""}
                          </p>
                        ) : expense.latestPaidAt ? (
                          <p className="mt-1 text-xs text-[var(--app-ink-muted)]">
                            Último pagamento em{" "}
                            {new Intl.DateTimeFormat("pt-BR").format(
                              new Date(`${expense.latestPaidAt}T00:00:00`),
                            )}
                          </p>
                        ) : null}
                      </div>

                      <div className="shrink-0 text-right">
                        <strong className="block text-base font-bold text-[var(--app-ink)]">
                          {formatCurrency(expense.amount)}
                        </strong>
                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(expense.status)}`}
                        >
                          {statusLabel(expense.status)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      {expense.active && expense.status !== "paid" ? (
                        <form action={launchFixedExpensePaymentAction}>
                          <input type="hidden" name="id" value={expense.id} />
                          <button
                            type="submit"
                            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <ReceiptText size={15} aria-hidden="true" />
                            Lançar pagamento
                          </button>
                        </form>
                      ) : expense.status === "paid" ? (
                        <span className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 size={15} aria-hidden="true" />
                          Pago no mês
                        </span>
                      ) : null}

                      <Link
                        href={`/ajustes?editar=${expense.id}`}
                        className="icon-button size-9"
                        aria-label="Editar gasto fixo"
                      >
                        <Edit3 size={17} aria-hidden="true" />
                      </Link>

                      <form action={toggleFixedExpenseAction}>
                        <input type="hidden" name="id" value={expense.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={expense.active ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="icon-button size-9"
                          aria-label={
                            expense.active
                              ? "Desativar gasto fixo"
                              : "Ativar gasto fixo"
                          }
                        >
                          {expense.active ? (
                            <Pause size={17} aria-hidden="true" />
                          ) : (
                            <Play size={17} aria-hidden="true" />
                          )}
                        </button>
                      </form>

                      <form action={deleteFixedExpenseAction}>
                        <input type="hidden" name="id" value={expense.id} />
                        <button
                          type="submit"
                          className="btn-danger size-9"
                          aria-label="Excluir gasto fixo"
                        >
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </section>
            </div>
          </>
        ) : null}
      </main>
      <MobileNavigation />
    </div>
  );
}


