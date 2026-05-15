import Link from "next/link";
import {
  CalendarClock,
  BarChart3,
  CreditCard,
  Edit3,
  Layers3,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import { FixedExpenseForm } from "@/components/finance/fixed-expense-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { formatCurrency } from "@/lib/formatters";
import { requireCurrentUserId } from "@/server/auth/current-user";
import {
  deleteFixedExpenseAction,
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

function statusLabel(status: "upcoming" | "overdue" | "inactive") {
  if (status === "inactive") {
    return "Inativo";
  }

  if (status === "overdue") {
    return "Vencido";
  }

  return "Próximo";
}

function statusClasses(status: "upcoming" | "overdue" | "inactive") {
  if (status === "inactive") {
    return "bg-slate-100 text-slate-500";
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] pb-28 md:pb-0">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-100/70">
              <CalendarClock size={16} aria-hidden="true" />
              Ajustes financeiros
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">
              Gastos fixos
            </h1>
            <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
              Controle cobranças recorrentes como internet, academia,
              assinaturas e celular.
            </p>
          </div>
          <LogoutButton />
        </header>

        {error ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </section>
        ) : null}

        {data ? (
          <>
            <section className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/70">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"
                    aria-hidden="true"
                  >
                    <CreditCard size={20} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      Cartões manuais
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Gerencie limites, fechamento e fatura estimada dos cartões.
                    </p>
                  </div>
                  <Link
                    href="/cartoes"
                    className="ml-auto hidden min-h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 sm:inline-flex"
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
                    <h2 className="text-base font-semibold text-slate-950">
                      Categorias
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Personalize grupos de despesas e receitas.
                    </p>
                  </div>
                  <Link
                    href="/categorias"
                    className="ml-auto hidden min-h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 sm:inline-flex"
                  >
                    Abrir categorias
                  </Link>
                </div>
                <div className="grid gap-2 sm:hidden">
                  <Link
                    href="/cartoes"
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Abrir cartões
                  </Link>
                  <Link
                    href="/categorias"
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
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
                    <h2 className="text-base font-semibold text-slate-950">
                      Relatórios
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Veja categorias, formas de pagamento e comparativos.
                    </p>
                  </div>
                  <Link
                    href="/relatorios"
                    className="ml-auto hidden min-h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 sm:inline-flex"
                  >
                    Abrir relatórios
                  </Link>
                </div>
                <Link
                  href="/relatorios"
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 sm:hidden"
                >
                  Abrir relatórios
                </Link>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                <p className="text-sm font-medium text-slate-500">
                  Total ativo mensal
                </p>
                <strong className="mt-2 block text-2xl font-semibold text-slate-950">
                  {formatCurrency(data.summary.activeMonthlyTotal)}
                </strong>
              </article>

              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                <p className="text-sm font-medium text-slate-500">
                  Próximos vencimentos
                </p>
                <strong className="mt-2 block text-2xl font-semibold text-slate-950">
                  {formatCurrency(data.summary.upcomingTotal)}
                </strong>
                <p className="mt-2 text-sm text-slate-500">
                  {data.summary.upcomingCount} item(ns) neste mês
                </p>
              </article>

              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
                <p className="text-sm font-medium text-slate-500">
                  Vencidos no mês
                </p>
                <strong className="mt-2 block text-2xl font-semibold text-slate-950">
                  {formatCurrency(data.summary.overdueTotal)}
                </strong>
                <p className="mt-2 text-sm text-slate-500">
                  {data.summary.overdueCount} item(ns) já passaram
                </p>
              </article>
            </section>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <section>
                <div className="mb-3">
                  <h2 className="text-base font-semibold text-slate-950">
                    {isEditing ? "Editar gasto fixo" : "Novo gasto fixo"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Mantenha a lista enxuta para a dashboard ficar precisa.
                  </p>
                </div>

                {isEditing && !editableExpense ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
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
                  <h2 className="text-base font-semibold text-slate-950">
                    Recorrências cadastradas
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Ativos e inativos aparecem juntos para facilitar ajustes.
                  </p>
                </div>

                {data.expenses.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/70">
                    <h3 className="text-base font-semibold text-slate-950">
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
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70"
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
                        <p className="mt-1 text-xs text-slate-500">
                          {expense.categoryName} •{" "}
                          {paymentMethodLabels[expense.paymentMethod]}
                          {expense.cardName ? ` • ${expense.cardName}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Vence dia {expense.dueDay}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <strong className="block text-base font-semibold text-slate-950">
                          {formatCurrency(expense.amount)}
                        </strong>
                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(expense.status)}`}
                        >
                          {statusLabel(expense.status)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-1">
                      <Link
                        href={`/ajustes?editar=${expense.id}`}
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
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
                          className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
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
                          className="flex size-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50"
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
