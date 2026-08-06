import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CreditCard,
  Edit3,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
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
        "Não foi possível carregar os cartões. Verifique a conexão e tente novamente.",
    };
  }
}

export default async function CardsPage({ searchParams }: CardsPageProps) {
  const { editar, cartao } = await searchParams;
  const { data, editableCard, error } = await loadPageData(cartao, editar);
  const isEditing = Boolean(editar);
  const totalCurrentInvoice =
    data?.cards.reduce((sum, card) => sum + card.currentInvoiceTotal, 0) ?? 0;
  const totalNextInvoice =
    data?.cards.reduce((sum, card) => sum + card.nextInvoiceTotal, 0) ?? 0;
  const cardsNearLimit =
    data?.cards.filter((card) => card.limitAlert).length ?? 0;

  return (
    <div className="app-shell">
      <main className="flex w-full max-w-none flex-col gap-8 px-0 py-5 sm:px-5 md:py-8 lg:px-6 xl:px-8">
        <header className="card-reveal relative overflow-hidden rounded-[2rem] bg-[var(--app-primary)] p-6 text-white shadow-[0_30px_80px_rgb(20_23_21_/_0.22)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-[#4b806a]/45 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-sm font-bold text-white/70">
                <CreditCard size={16} aria-hidden="true" />
                Central de crédito
              </span>
              <h1 className="mt-6 text-[clamp(2.8rem,9vw,5.7rem)] font-bold leading-[0.9] tracking-[-0.07em]">
                Cartões
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
                Faturas, compras e limites reunidos em um espaço feito para consultar e agir rapidamente.
              </p>

              <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                <a href="#meus-cartoes" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-extrabold text-[var(--app-primary)] transition hover:-translate-y-0.5">
                  Ver meus cartões
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
                <a href="#configurar-cartao" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/8 px-4 text-sm font-extrabold text-white transition hover:bg-white/12">
                  <Plus size={17} aria-hidden="true" />
                  Novo cartão
                </a>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5 backdrop-blur sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/42">
                Faturas atuais
              </p>
              <strong className="mt-3 block text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
                {formatCurrency(totalCurrentInvoice)}
              </strong>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                <div>
                  <p className="text-xs font-semibold text-white/45">Próximas</p>
                  <strong className="mt-1 block text-base font-bold">
                    {formatCurrency(totalNextInvoice)}
                  </strong>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/45">Cartões ativos</p>
                  <strong className="mt-1 block text-base font-bold">
                    {data?.cards.length ?? 0}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <section className="alert-danger p-4 text-sm">{error}</section>
        ) : null}

        {data ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <article className="metric-card min-h-0">
                <span className="metric-card-icon bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                  <WalletCards size={18} aria-hidden="true" />
                </span>
                <p>Faturas atuais</p>
                <strong>{formatCurrency(totalCurrentInvoice)}</strong>
              </article>
              <article className="metric-card min-h-0">
                <span className="metric-card-icon bg-[#e7e6ff] text-[#5148a8]">
                  <CalendarDays size={18} aria-hidden="true" />
                </span>
                <p>Próximas faturas</p>
                <strong>{formatCurrency(totalNextInvoice)}</strong>
              </article>
              <article className="metric-card min-h-0">
                <span className="metric-card-icon bg-[#fff3d6] text-[#87600b]">
                  <AlertTriangle size={18} aria-hidden="true" />
                </span>
                <p>Próximos do limite</p>
                <strong>{cardsNearLimit}</strong>
              </article>
            </section>

            <section id="meus-cartoes" className="scroll-mt-28">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-eyebrow">Sua carteira</p>
                  <h2 className="section-title mt-1">Meus cartões</h2>
                </div>
                <a href="#configurar-cartao" className="btn-secondary w-fit">
                  <Plus size={16} aria-hidden="true" />
                  Adicionar cartão
                </a>
              </div>

              {data.cards.length === 0 ? (
                <div className="app-card p-8 text-center sm:p-12">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                    <CreditCard size={24} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold text-[var(--app-ink)]">
                    Sua carteira ainda está vazia
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--app-ink-muted)]">
                    Cadastre um cartão para acompanhar faturas, limites e compras parceladas.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                  {data.cards.map((card, index) => {
                    const cardColor = card.color ?? "#315f52";
                    const progress = card.usedPercentage ?? 0;
                    const returnPath = `/cartoes/${card.id}`;

                    return (
                      <article
                        key={card.id}
                        className="card-reveal app-card overflow-hidden"
                        style={{ animationDelay: `${Math.min(index * 70, 350)}ms` }}
                      >
                        <Link
                          href={`/cartoes/${card.id}`}
                          className="credit-card-visual relative flex min-h-72 flex-col justify-between overflow-hidden p-6 text-white"
                          style={{
                            background: `linear-gradient(135deg, ${cardColor} 0%, #151c19 72%, #080b0a 100%)`,
                          }}
                        >
                          <span className="credit-card-shine" aria-hidden="true" />
                          <div className="relative flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/45">
                                Meu Mês
                              </p>
                              <h3 className="mt-2 truncate text-2xl font-extrabold tracking-[-0.04em]">
                                {card.name}
                              </h3>
                            </div>
                            <CreditCard size={25} aria-hidden="true" />
                          </div>

                          <div className="relative mt-12">
                            <p className="text-sm font-semibold text-white/55">Fatura atual</p>
                            <strong className="mt-2 block text-4xl font-bold tracking-[-0.055em]">
                              {formatCurrency(card.currentInvoiceTotal)}
                            </strong>
                          </div>

                          <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-white/12 pt-4">
                            <div>
                              <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white/42">Fecha</p>
                              <strong className="mt-1 block text-sm">{formatDate(card.currentInvoice.closingDate)}</strong>
                            </div>
                            <div>
                              <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white/42">Vence</p>
                              <strong className="mt-1 block text-sm">{formatDate(card.currentInvoice.dueDate)}</strong>
                            </div>
                          </div>
                        </Link>

                        <div className="p-5">
                          {card.limitAmount !== null ? (
                            <div>
                              <div className="flex items-center justify-between gap-3 text-xs font-bold text-[var(--app-ink-muted)]">
                                <span>{progress}% do limite utilizado</span>
                                <span>{formatCurrency(card.availableLimit ?? 0)} livres</span>
                              </div>
                              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/[0.06]">
                                <div
                                  className={`h-full rounded-full transition-[width] duration-700 ${
                                    card.limitAlert ? "bg-[var(--app-warning)]" : "bg-[var(--app-accent)]"
                                  }`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-[var(--app-ink-muted)]">
                              Defina um limite para acompanhar o uso deste cartão.
                            </p>
                          )}

                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <div className="metric-tile">
                              <p className="text-xs font-bold text-[var(--app-ink-muted)]">Próxima fatura</p>
                              <strong className="mt-1 block text-base font-extrabold text-[var(--app-ink)]">
                                {formatCurrency(card.nextInvoiceTotal)}
                              </strong>
                            </div>
                            <div className="metric-tile">
                              <p className="text-xs font-bold text-[var(--app-ink-muted)]">Compras atuais</p>
                              <strong className="mt-1 block text-base font-extrabold text-[var(--app-ink)]">
                                {card.currentInvoice.purchaseCount}
                              </strong>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap items-center gap-2">
                            <Link href={`/cartoes/${card.id}`} className="btn-primary flex-1">
                              Abrir fatura
                              <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                            <Link
                              href={`/novo?tipo=despesa&cartao=${card.id}&voltar=${encodeURIComponent(returnPath)}`}
                              className="icon-button size-11 rounded-2xl"
                              aria-label={`Registrar compra em ${card.name}`}
                              title="Registrar compra"
                            >
                              <Plus size={18} aria-hidden="true" />
                            </Link>
                            <Link
                              href={`/cartoes?editar=${card.id}&cartao=${card.id}#configurar-cartao`}
                              className="icon-button size-11 rounded-2xl"
                              aria-label={`Editar ${card.name}`}
                            >
                              <Edit3 size={18} aria-hidden="true" />
                            </Link>

                            {card.linkedItemsCount === 0 ? (
                              <form action={deleteCardAction}>
                                <input type="hidden" name="id" value={card.id} />
                                <button
                                  type="submit"
                                  className="btn-danger size-11 rounded-2xl"
                                  aria-label={`Excluir ${card.name}`}
                                >
                                  <Trash2 size={18} aria-hidden="true" />
                                </button>
                              </form>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section
              id="configurar-cartao"
              className="scroll-mt-28 grid gap-5 rounded-[2rem] bg-black/[0.025] p-4 sm:p-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start"
            >
              <div className="p-2 sm:p-3">
                <p className="section-eyebrow">Configuração</p>
                <h2 className="section-title mt-1">
                  {isEditing ? "Editar cartão" : "Adicionar cartão"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--app-ink-muted)]">
                  Informe fechamento e vencimento para que cada compra seja colocada na fatura correta automaticamente.
                </p>
                <div className="mt-5 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-[var(--app-ink-muted)]">
                  Nenhuma integração bancária é realizada. Você mantém controle total sobre cada lançamento.
                </div>
              </div>

              <div>
                {isEditing && !editableCard ? (
                  <div className="alert-warning p-4 text-sm">
                    Cartão não encontrado para edição.
                  </div>
                ) : (
                  <CardForm initialCard={editableCard} />
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>
      <MobileNavigation />
    </div>
  );
}
