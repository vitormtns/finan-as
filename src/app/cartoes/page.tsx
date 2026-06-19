import Link from "next/link";
import { AlertTriangle, CreditCard, Edit3, Trash2 } from "lucide-react";
import { CardForm } from "@/components/finance/card-form";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { formatCurrency, formatDate } from "@/lib/formatters";
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

  return (
    <div className="app-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header className="premium-page-hero">
          <div className="relative">
          <div className="app-kicker">
            <CreditCard size={16} aria-hidden="true" />
            Fatura manual
          </div>
          <h1 className="mt-4 app-title">
            Cartões
          </h1>
          <p className="app-subtitle mt-2 max-w-xl">
            Cadastre cartões manuais e acompanhe quanto já foi usado no crédito.
          </p>
          </div>
        </header>

        {error ? (
          <section className="alert-danger p-4 text-sm">
            {error}
          </section>
        ) : null}

        {data ? (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section>
              <div className="mb-3">
                <h2 className="text-base font-bold text-[var(--app-ink)]">
                  {isEditing ? "Editar cartão" : "Novo cartão"}
                </h2>
                <p className="mt-1 text-sm text-[var(--app-ink-muted)]">
                  Use dados manuais. Nenhuma integração bancária é feita.
                </p>
              </div>

              {isEditing && !editableCard ? (
                <div className="alert-warning p-4 text-sm">
                  Cartão não encontrado para edição.
                </div>
              ) : (
                <CardForm initialCard={editableCard} />
              )}
            </section>

            <section className="space-y-3">
              <div>
                <h2 className="text-base font-bold text-[var(--app-ink)]">
                  Cartões cadastrados
                </h2>
                <p className="mt-1 text-sm text-[var(--app-ink-muted)]">
                  Faturas calculadas pelo fechamento de cada cartão.
                </p>
              </div>

              {data.cards.length === 0 ? (
                <div className="app-card p-6 text-center">
                  <h3 className="text-base font-bold text-[var(--app-ink)]">
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
                    className="app-card overflow-hidden"
                  >
                    <Link
                      href={`/cartoes/${card.id}`}
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
                          <p className="text-xs text-white/70">
                            Fatura atual
                          </p>
                          <strong className="mt-1 block text-lg font-semibold">
                            {formatCurrency(card.currentInvoiceTotal)}
                          </strong>
                        </div>
                        <div>
                          <p className="text-xs text-white/70">
                            Próxima fatura
                          </p>
                          <strong className="mt-1 block text-lg font-semibold">
                            {formatCurrency(card.nextInvoiceTotal)}
                          </strong>
                        </div>
                      </div>
                    </Link>

                    <div className="p-4">
                      {card.limitAmount !== null ? (
                        <div>
                          <div className="flex items-center justify-between gap-3 text-xs text-[var(--app-ink-muted)]">
                            <span>{progress}% do limite</span>
                            <span>{formatCurrency(card.limitAmount)}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-slate-100">
                            <div
                              className={`h-2 rounded-full ${
                                card.limitAlert ? "bg-amber-500" : "bg-blue-600"
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          {card.limitAlert ? (
                            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                              <AlertTriangle
                                className="mt-0.5 shrink-0"
                                size={15}
                                aria-hidden="true"
                              />
                              <span>
                                Mais de 80% do limite usado nesta fatura.
                              </span>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-sm text-[var(--app-ink-muted)]">
                          Limite não definido para este cartão.
                        </p>
                      )}

                      <div className="mt-4 grid gap-2 metric-tile text-sm text-slate-600 sm:grid-cols-2">
                        <span>
                          Fecha em {formatDate(card.currentInvoice.closingDate)}
                        </span>
                        <span>
                          Vence em {formatDate(card.currentInvoice.dueDate)}
                        </span>
                        <span>
                          Período: {formatDate(card.currentInvoice.periodStart)}
                        </span>
                        <span>
                          até {formatDate(card.currentInvoice.periodEnd)}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div className="metric-tile">
                          <p className="text-xs font-medium text-slate-500">
                            Disponível
                          </p>
                          <strong className="mt-1 block font-semibold text-slate-950">
                            {card.availableLimit === null
                              ? "Sem limite"
                              : formatCurrency(card.availableLimit)}
                          </strong>
                        </div>
                        <div className="metric-tile">
                          <p className="text-xs font-medium text-slate-500">
                            Compras na fatura
                          </p>
                          <strong className="mt-1 block font-semibold text-slate-950">
                            {card.currentInvoice.purchaseCount}
                          </strong>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end gap-1">
                        <Link
                          href={`/cartoes/${card.id}`}
                          className="flex min-h-9 items-center rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                        >
                          Ver fatura
                        </Link>
                        <Link
                          href={`/cartoes?editar=${card.id}&cartao=${card.id}`}
                          className="icon-button size-9"
                          aria-label="Editar cartão"
                        >
                          <Edit3 size={17} aria-hidden="true" />
                        </Link>

                        {card.linkedItemsCount === 0 ? (
                          <form action={deleteCardAction}>
                            <input type="hidden" name="id" value={card.id} />
                            <button
                              type="submit"
                              className="btn-danger size-9"
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
      </main>
      <MobileNavigation />
    </div>
  );
}

