"use client";

import { Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteTransactionAction } from "@/server/transactions/actions";

type InvoicePurchaseActionsProps = {
  purchaseId: string;
  cardId: string;
  isInstallment: boolean;
};

export function InvoicePurchaseActions({
  purchaseId,
  cardId,
  isInstallment,
}: InvoicePurchaseActionsProps) {
  const returnHref = `/cartoes/${cardId}`;

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Link
        href={`/novo?id=${purchaseId}&voltar=${encodeURIComponent(returnHref)}`}
        className="icon-button size-9 rounded-full"
        aria-label={isInstallment ? "Editar esta parcela" : "Editar compra"}
        title={isInstallment ? "Editar esta parcela" : "Editar compra"}
      >
        <Edit3 size={16} aria-hidden="true" />
      </Link>

      <form
        action={deleteTransactionAction}
        onSubmit={(event) => {
          const message = isInstallment
            ? "Excluir somente esta parcela da fatura? As demais parcelas serão mantidas."
            : "Excluir esta compra da fatura? Esta ação não pode ser desfeita.";

          if (!window.confirm(message)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={purchaseId} />
        <button
          type="submit"
          className="btn-danger size-9 rounded-full"
          aria-label={isInstallment ? "Excluir esta parcela" : "Excluir compra"}
          title={isInstallment ? "Excluir esta parcela" : "Excluir compra"}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
