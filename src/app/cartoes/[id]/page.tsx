import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CreditCard,
  Edit3,
  Plus,
  WalletCards,
} from "lucide-react";
import { CardInvoiceWorkspace } from "@/components/finance/card-invoice-workspace";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { formatCurrency, formatDate, formatMonth } from "@/lib/formatters";
import { requireCurrentUserId } from "@/server/auth/current-user";
import type { FutureInstallmentMonth } from "@/server/cards/invoice";
import { getCardInvoiceDetail } from "@/server/cards/service";

export const dynamic = "force-dynamic";

type CardDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function FutureInstallmentsCard({
  installments,
}: {
  installments: FutureInstallmentMonth[];
}) {
  const total = installments.reduce((sum, item) => sum + item.total, 0);

  return (
    <section className="app-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-eyebrow">Visão adiante</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[var(--app-ink)]">
            Parcelas futuras
          </h2>
          <p className="mt-2 text-sm text-[var(--app-ink-muted)]">
            Valores deste cartão que já estão comprometidos nos próximos meses.
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--app-primary-soft)] px-4 py-3 sm:text-right">
          <p className="text-xs font-bold text-[var(--app-ink-muted)]">Total futuro</p>
          <strong className="mt-1 block text-lg font-extrabold text-[var(--app-ink)]">
            {formatCurrency(total)}
          </strong>
        </div>
      </div>

      {installments.length === 0 ? (
        <div className="empty-state mt-5 text-sm leading-6">
          Nenhuma parcela futura prevista para este cartão.
        </div>
      ) : (
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {installments.map((item) => (
            <div
              className="flex items-center justify-between gap-3 rounded-2xl bg-black/[0.025] p-4"
              key={`${item.year}-${item.month}`}
            >
              <span className="text-sm font-bold text-[var(--app-ink-muted)]">
                {formatMonth(new Date(item.year, item.month - 1, 1))}
              </span>
              <strong className="text-sm font-extrabold text-[var(--app-ink)]">
                {formatCurrency(item.total)}
              </strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { id } = await params;
  const userId = await requireCurrentUserId();
  const card = await getCardInvoiceDetail(userId, id);

  if (!card) {
    notFound();
  }

  const cardColor = card.color ?? "#315f52";
  const usedPercentage = card.usedPercentage ?? 0;
  const returnPath = `/cartoes/${card.id}`;

  return (
    <div className="app-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 md:py-8 lg:px-8">
        <Link
          href="/cartoes"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-[var(--app-primary)] shadow-sm transition hover:bg-white"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Todos os cartões
        </Link>

        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <article
            className="credit-card-visual card-reveal relative flex min-h-[25rem] flex-col justify-between overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_30px_80px_rgb(20_23_21_/_0.25)] sm:p-8"
            style={{
              background: `linear-gradient(135deg, ${cardColor} 0%, #151c19 72%, #080b0a 100%)`,
            }}
          >
            <div className="credit-card-shine" aria-hidden="true" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/48">
                  Meu Mês
                </p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                  {card.name}
                </h1>
              </div>
              <span className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
                <CreditCard size={23} aria-hidden="true" />
              </span>
            </div>

            <div className="relative mt-16">
              <p className="text-sm font-semibold text-white/58">Fatura atual</p>
              <strong className="mt-2 block text-[clamp(2.8rem,10vw,5rem)] font-bold leading-none tracking-[-0.07em]">
                {formatCurrency(card.currentInvoiceTotal)}
              </strong>
            </div>

            <div className="relative mt-10 grid grid-cols-2 gap-4 border-t border-white/12 pt-5">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/42">
                  Fechamento
                </p>
                <strong className="mt-1 block text-sm font-bold">
                  {formatDate(card.currentInvoice.closingDate)}
                </strong>
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/42">
                  Vencimento
                </p>
                <strong className="mt-1 block text-sm font-bold">
                  {formatDate(card.currentInvoice.dueDate)}
                </strong>
              </div>
            </div>
          </article>

          <aside className="app-card flex flex-col justify-between p-5 sm:p-6">
            <div>
              <p className="section-eyebrow">Acesso rápido</p>
              <h2 className="section-title mt-1">Central do cartão</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--app-ink-muted)]">
                Registre uma compra ou ajuste as informações deste cartão sem procurar em outras telas.
              </p>

              <div className="mt-6 grid gap-2">
                <Link
                  href={`/novo?tipo=despesa&cartao=${card.id}&voltar=${encodeURIComponent(returnPath)}`}
                  className="btn-primary min-h-13 justify-between px-4"
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus size={18} aria-hidden="true" />
                    Registrar compra
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link
                  href={`/cartoes?editar=${card.id}&cartao=${card.id}#configurar-cartao`}
                  className="btn-secondary min-h-12 justify-between px-4"
                >
                  <span className="inline-flex items-center gap-2">
                    <Edit3 size={17} aria-hidden="true" />
                    Editar cartão
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>

            {card.limitAmount !== null ? (
              <div className="mt-8 rounded-[1.35rem] bg-[var(--app-surface-muted)] p-4">
                <div className="flex items-center justify-between gap-3 text-xs font-bold text-[var(--app-ink-muted)]">
                  <span>Limite utilizado</span>
                  <span>{usedPercentage}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/[0.07]">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${
                      card.limitAlert ? "bg-[var(--app-warning)]" : "bg-[var(--app-accent)]"
                    }`}
                    style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--app-ink-muted)]">
                  {formatCurrency(card.availableLimit ?? 0)} disponíveis de {formatCurrency(card.limitAmount)}.
                </p>
              </div>
            ) : null}
          </aside>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <article className="metric-card min-h-0">
            <span className="metric-card-icon bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
              <WalletCards size={18} aria-hidden="true" />
            </span>
            <p>Limite disponível</p>
            <strong>
              {card.availableLimit === null
                ? "Não definido"
                : formatCurrency(card.availableLimit)}
            </strong>
          </article>
          <article className="metric-card min-h-0">
            <span className="metric-card-icon bg-[#e7e6ff] text-[#5148a8]">
              <CalendarDays size={18} aria-hidden="true" />
            </span>
            <p>Próxima fatura</p>
            <strong>{formatCurrency(card.nextInvoiceTotal)}</strong>
          </article>
          <article className="metric-card min-h-0">
            <span className="metric-card-icon bg-[#fff3d6] text-[#87600b]">
              <CreditCard size={18} aria-hidden="true" />
            </span>
            <p>Compras na fatura atual</p>
            <strong>{card.currentInvoice.purchaseCount}</strong>
          </article>
        </section>

        <CardInvoiceWorkspace
          cardId={card.id}
          currentInvoice={card.currentInvoice}
          nextInvoice={card.nextInvoice}
        />

        <FutureInstallmentsCard installments={card.futureInstallments} />
      </main>
      <MobileNavigation />
    </div>
  );
}
