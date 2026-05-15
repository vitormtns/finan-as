import Link from "next/link";
import { CreditCard, Edit3, Trash2 } from "lucide-react";
import { CardForm } from "@/components/finance/card-form";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { deleteCardAction } from "@/server/cards/actions";
import { getCardsPageData, getEditableCard } from "@/server/cards/service";
import type { CardsPageData, EditableCard } from "@/server/cards/types";

export const dynamic = "force-dynamic";

type CardsPageProps = {
  searchParams: Promise<{
    editar?: string;
    cartao?: string;
  }>;
};

async function loadPageData(
  selectedCardId?: string,
  editingCardId?: string,
): Promise<{
  data: CardsPageData | null;
  editableCard: EditableCard | null;
  error: string | null;
}> {
  const userId = await requireCurrentUserId();

  try {
    const [data, editableCard] = await Promise.all([
      getCardsPageData(userId, selectedCardId),
      editingCardId ? getEditableCard(userId, editingCardId) : null,
    ]);

    return { data, editableCard, error: null };
  } catch {
    return {
      data: null,
      editableCard: null,
      error:
        "Não foi possível carregar os cartões. Verifique a conexão com o banco.",
    };
  }
}

export default async function CardsPage({ searchParams }: CardsPageProps) {
  const { editar, cartao } = await searchParams;
  const { data, editableCard, error } = await loadPageData(cartao, editar);
  const isEditing = Boolean(editar);
  const currentMonth = formatMonth(new Date());

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] pb-28 md:pb-0">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-100/70">
            <CreditCard size={16} aria-hidden="true" />
            Fatura manual
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">
            Cartões
          </h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
            Cadastre cartões manuais e acompanhe quanto já foi usado no crédito.
          </p>
        </header>

        {error ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </section>
        ) : null}

        {data ? (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section>
              <div className="mb-3">
                <h2 className="text-base font-semibold text-slate-950">
                  {isEditing ? "Editar cartão" : "Novo cartão"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Use dados manuais. Nenhuma integração bancária é feita.
                </p>
              </div>

              {isEditing && !editableCard ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Cartão não encontrado para edição.
                </div>
              ) : (
                <CardForm initialCard={editableCard} />
              )}
            </section>

            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Cartões cadastrados
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Uso calculado com compras no crédito em {currentMonth}.
                </p>
              </div>

              {data.cards.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/70">
                  <h3 className="text-base font-semibold text-slate-950">
                    Nenhum cartão cadastrado
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Cadastre seu primeiro cartão para acompanhar faturas
                    manuais.
                  </p>
                </div>
              ) : null}

              {data.cards.map((card) => {
                const cardColor = card.color ?? "#2563eb";
                const progress = card.usedPercentage ?? 0;

                return (
                  <article
                    key={card.id}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-200/70"
                  >
                    <Link
                      href={`/cartoes?cartao=${card.id}`}
                      className="block p-4 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${cardColor}, #0f172a)`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-white/75">Cartão</p>
                          <h3 className="mt-1 truncate text-xl font-semibold">
                            {card.name}
                          </h3>
                        </div>
                        <CreditCard size={24} aria-hidden="true" />
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-white/70">Usado no mês</p>
                          <strong className="mt-1 block text-lg font-semibold">
                            {formatCurrency(card.currentMonthTotal)}
                          </strong>
                        </div>
                        <div>
                          <p className="text-xs text-white/70">Disponível</p>
                          <strong className="mt-1 block text-lg font-semibold">
                            {card.availableLimit === null
                              ? "Sem limite"
                              : formatCurrency(card.availableLimit)}
                          </strong>
                        </div>
                      </div>
                    </Link>

                    <div className="p-4">
                      {card.limitAmount !== null ? (
                        <div>
                          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                            <span>{progress}% do limite</span>
                            <span>{formatCurrency(card.limitAmount)}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-slate-100">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Limite não definido para este cartão.
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
                        <span>Fecha dia {card.closingDay ?? "-"}</span>
                        <span>Vence dia {card.dueDay ?? "-"}</span>
                      </div>

                      <div className="mt-4 flex justify-end gap-1">
                        <Link
                          href={`/cartoes?editar=${card.id}&cartao=${card.id}`}
                          className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                          aria-label="Editar cartão"
                        >
                          <Edit3 size={17} aria-hidden="true" />
                        </Link>

                        {card.linkedItemsCount === 0 ? (
                          <form action={deleteCardAction}>
                            <input type="hidden" name="id" value={card.id} />
                            <button
                              type="submit"
                              className="flex size-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50"
                              aria-label="Excluir cartão"
                            >
                              <Trash2 size={17} aria-hidden="true" />
                            </button>
                          </form>
                        ) : (
                          <span className="flex min-h-9 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-500">
                            Vinculado
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </div>
        ) : null}

        {data?.selectedCard ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Fatura estimada
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Compras no crédito em {currentMonth} para{" "}
                  {data.selectedCard.name}.
                </p>
              </div>
              <strong className="text-2xl font-semibold text-slate-950">
                {formatCurrency(data.selectedCard.currentMonthTotal)}
              </strong>
            </div>

            {data.selectedCard.invoiceTransactions.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
                Nenhuma compra no crédito neste mês para este cartão.
              </div>
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {data.selectedCard.invoiceTransactions.map((transaction) => (
                  <div
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    key={transaction.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {transaction.description}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {transaction.categoryName} •{" "}
                        {new Intl.DateTimeFormat("pt-BR").format(
                          new Date(`${transaction.date}T00:00:00`),
                        )}
                        {transaction.installmentLabel
                          ? ` • ${transaction.installmentLabel}`
                          : ""}
                      </p>
                    </div>
                    <strong className="shrink-0 text-sm font-semibold text-slate-950">
                      {formatCurrency(transaction.amount)}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
      <MobileNavigation />
    </div>
  );
}
