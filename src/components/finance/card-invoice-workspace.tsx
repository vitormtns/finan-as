"use client";

import { CalendarDays, ReceiptText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { CardInvoicePurchase } from "@/server/cards/invoice";
import type { CardInvoiceView } from "@/server/cards/types";
import { InvoicePurchaseActions } from "./invoice-purchase-actions";

type InvoiceKey = "current" | "next";

type CardInvoiceWorkspaceProps = {
  cardId: string;
  currentInvoice: CardInvoiceView;
  nextInvoice: CardInvoiceView;
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function filterPurchases(purchases: CardInvoicePurchase[], query: string) {
  const normalizedQuery = normalizeSearch(query.trim());

  if (!normalizedQuery) {
    return purchases;
  }

  return purchases.filter((purchase) =>
    normalizeSearch(`${purchase.description} ${purchase.categoryName}`).includes(
      normalizedQuery,
    ),
  );
}

export function CardInvoiceWorkspace({
  cardId,
  currentInvoice,
  nextInvoice,
}: CardInvoiceWorkspaceProps) {
  const [activeInvoice, setActiveInvoice] = useState<InvoiceKey>("current");
  const [query, setQuery] = useState("");
  const invoice = activeInvoice === "current" ? currentInvoice : nextInvoice;
  const purchases = useMemo(
    () => filterPurchases(invoice.purchases, query),
    [invoice.purchases, query],
  );

  return (
    <section className="app-card overflow-hidden">
      <div className="border-b border-black/[0.06] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-eyebrow">Central da fatura</p>
            <h2 className="section-title mt-1">Compras e lançamentos</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-ink-muted)]">
              Pesquise, revise e corrija qualquer item sem perder o contexto da fatura.
            </p>
          </div>

          <label className="relative block w-full lg:max-w-xs">
            <span className="sr-only">Buscar na fatura</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-ink-faint)]"
              size={18}
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar compra ou categoria"
              className="form-control min-h-12 pl-11"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-2 rounded-[1.35rem] bg-[var(--app-surface-muted)] p-1.5 sm:grid-cols-2">
          {(
            [
              ["current", "Fatura atual", currentInvoice],
              ["next", "Próxima fatura", nextInvoice],
            ] as const
          ).map(([key, label, item]) => {
            const isActive = activeInvoice === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveInvoice(key);
                  setQuery("");
                }}
                className={`flex min-h-20 items-center justify-between rounded-[1.05rem] px-4 text-left transition ${
                  isActive
                    ? "bg-white text-[var(--app-ink)] shadow-[0_10px_26px_rgb(24_28_25_/_0.09)]"
                    : "text-[var(--app-ink-muted)] hover:bg-white/50"
                }`}
                aria-pressed={isActive}
              >
                <span>
                  <span className="block text-xs font-bold">{label}</span>
                  <strong className="mt-1 block text-xl font-extrabold tracking-[-0.035em]">
                    {formatCurrency(item.total)}
                  </strong>
                </span>
                <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--app-primary)]">
                  {item.purchaseCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 border-b border-black/[0.06] bg-black/[0.018] px-5 py-4 text-sm text-[var(--app-ink-muted)] sm:grid-cols-3 sm:px-6">
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={16} aria-hidden="true" />
          Fecha em {formatDate(invoice.closingDate)}
        </span>
        <span className="inline-flex items-center gap-2">
          <ReceiptText size={16} aria-hidden="true" />
          Vence em {formatDate(invoice.dueDate)}
        </span>
        <span className="sm:text-right">
          {invoice.installmentCount} parcela{invoice.installmentCount === 1 ? "" : "s"} nesta fatura
        </span>
      </div>

      <div className="p-3 sm:p-4">
        {purchases.length === 0 ? (
          <div className="empty-state m-2 py-10 text-center text-sm leading-6">
            {query
              ? "Nenhum lançamento corresponde à sua busca."
              : "Nenhuma compra nesta fatura."}
          </div>
        ) : (
          <div className="divide-y divide-black/[0.06]">
            {purchases.map((purchase, index) => (
              <article
                key={purchase.id}
                className="invoice-row flex items-start justify-between gap-3 rounded-2xl px-2 py-4 transition hover:bg-black/[0.025] sm:px-3"
                style={{ animationDelay: `${Math.min(index * 35, 280)}ms` }}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                    <ReceiptText size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold text-[var(--app-ink)]">
                      {purchase.description}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[var(--app-ink-muted)]">
                      {purchase.categoryName} • {formatDate(purchase.date)}
                      {purchase.installmentLabel
                        ? ` • Parcela ${purchase.installmentLabel}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <strong className="text-sm font-extrabold text-[var(--app-ink)]">
                    {formatCurrency(purchase.amount)}
                  </strong>
                  <InvoicePurchaseActions
                    purchaseId={purchase.id}
                    cardId={cardId}
                    isInstallment={Boolean(purchase.installmentLabel)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
