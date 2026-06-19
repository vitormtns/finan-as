import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { formatCurrency, formatDate, formatMonth } from "@/lib/formatters";
import { requireCurrentUserId } from "@/server/auth/current-user";
import type {
  CardInvoicePurchase,
  FutureInstallmentMonth,
} from "@/server/cards/invoice";
import { getCardInvoiceDetail } from "@/server/cards/service";
import type { CardInvoiceView } from "@/server/cards/types";

export const dynamic = "force-dynamic";

type CardDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function InvoiceSummaryCard({
  title,
  invoice,
}: {
  title: string;
  invoice: CardInvoiceView;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <strong className="mt-2 block text-3xl font-semibold text-slate-950">
        {formatCurrency(invoice.total)}
      </strong>
      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <span>Fecha em {formatDate(invoice.closingDate)}</span>
        <span>Vence em {formatDate(invoice.dueDate)}</span>
        <span>Compras: {invoice.purchaseCount}</span>
        <span>Parcelas: {invoice.installmentCount}</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Período de {formatDate(invoice.periodStart)} até{" "}
        {formatDate(invoice.periodEnd)}.
      </p>
    </section>
  );
}

function InvoicePurchaseList({
  title,
  purchases,
}: {
  title: string;
  purchases: CardInvoicePurchase[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>

      {purchases.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
          Nenhuma compra nesta fatura.
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-100">
          {purchases.map((purchase) => (
            <div
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              key={purchase.id}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {purchase.description}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {purchase.categoryName} • {formatDate(purchase.date)}
                  {purchase.installmentLabel
                    ? ` • ${purchase.installmentLabel}`
                    : ""}
                </p>
              </div>
              <strong className="shrink-0 text-sm font-semibold text-slate-950">
                {formatCurrency(purchase.amount)}
              </strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FutureInstallmentsCard({
  installments,
}: {
  installments: FutureInstallmentMonth[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
      <h2 className="text-base font-semibold text-slate-950">
        Parcelas futuras
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Valores já comprometidos nos próximos meses.
      </p>

      {installments.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
          Nenhuma parcela futura prevista para este cartão.
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-100">
          {installments.map((item) => (
            <div
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              key={`${item.year}-${item.month}`}
            >
              <span className="text-sm font-medium text-slate-700">
                {formatMonth(new Date(item.year, item.month - 1, 1))}
              </span>
              <strong className="text-sm font-semibold text-slate-950">
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] pb-28 md:pb-0">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header>
          <Link
            href="/cartoes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Voltar para cartões
          </Link>

          <div className="mt-5 flex items-start gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: card.color ?? "#2563eb" }}
              aria-hidden="true"
            >
              <CreditCard size={21} />
            </span>
            <div>
              <h1 className="text-3xl font-semibold text-slate-950">
                {card.name}
              </h1>
              <p className="mt-2 text-base leading-7 text-slate-600">
                Faturas calculadas pelo ciclo real do cartão.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
            <p className="text-sm font-medium text-slate-500">Limite</p>
            <strong className="mt-2 block text-xl font-semibold text-slate-950">
              {card.limitAmount === null
                ? "Sem limite"
                : formatCurrency(card.limitAmount)}
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
            <p className="text-sm font-medium text-slate-500">Disponível</p>
            <strong className="mt-2 block text-xl font-semibold text-slate-950">
              {card.availableLimit === null
                ? "Sem limite"
                : formatCurrency(card.availableLimit)}
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
            <p className="text-sm font-medium text-slate-500">Fechamento</p>
            <strong className="mt-2 block text-xl font-semibold text-slate-950">
              Dia {card.closingDay ?? "-"}
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
            <p className="text-sm font-medium text-slate-500">Vencimento</p>
            <strong className="mt-2 block text-xl font-semibold text-slate-950">
              Dia {card.dueDay ?? "-"}
            </strong>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <InvoiceSummaryCard
            title="Fatura atual"
            invoice={card.currentInvoice}
          />
          <InvoiceSummaryCard
            title="Próxima fatura"
            invoice={card.nextInvoice}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <InvoicePurchaseList
            title="Compras da fatura atual"
            purchases={card.currentInvoice.purchases}
          />
          <InvoicePurchaseList
            title="Compras da próxima fatura"
            purchases={card.nextInvoice.purchases}
          />
        </section>

        <FutureInstallmentsCard installments={card.futureInstallments} />
      </main>
      <MobileNavigation />
    </div>
  );
}
