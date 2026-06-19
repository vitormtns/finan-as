import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TransactionForm } from "@/components/finance/transaction-form";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { requireCurrentUserId } from "@/server/auth/current-user";
import {
  findTransactionForEdit,
  listTransactionFormOptions,
} from "@/server/transactions/repository";
import { getTransactionDuplicateDraft } from "@/server/transactions/service";
import type {
  EditableTransaction,
  TransactionFormOptions,
} from "@/server/transactions/types";

export const dynamic = "force-dynamic";

type NewTransactionPageProps = {
  searchParams: Promise<{
    id?: string;
    duplicar?: string;
  }>;
};

async function loadPageData(params: { id?: string; duplicateId?: string }): Promise<{
  options: TransactionFormOptions;
  transaction: EditableTransaction | null;
  error: string | null;
}> {
  const userId = await requireCurrentUserId();

  try {
    const [options, transaction] = await Promise.all([
      listTransactionFormOptions(userId),
      params.id
        ? findTransactionForEdit(userId, params.id)
        : params.duplicateId
          ? getTransactionDuplicateDraft(userId, params.duplicateId)
          : Promise.resolve(null),
    ]);

    return { options, transaction, error: null };
  } catch {
    return {
      options: { categories: [], cards: [] },
      transaction: null,
      error:
        "Não foi possível carregar os dados do formulário. Verifique a conexão com o banco.",
    };
  }
}

export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const { id, duplicar } = await searchParams;
  const { options, transaction, error } = await loadPageData({
    id,
    duplicateId: id ? undefined : duplicar,
  });
  const isEditing = Boolean(id);
  const isDuplicating = !isEditing && Boolean(duplicar);

  return (
    <div className="app-shell">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header className="premium-page-hero">
          <div className="relative">
          <Link
            href="/gastos"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-[var(--app-primary)] shadow-sm transition hover:bg-white"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Voltar para gastos
          </Link>

          <h1 className="mt-5 app-title">
            {isEditing
              ? "Editar gasto"
              : isDuplicating
                ? "Duplicar gasto"
                : "Novo gasto"}
          </h1>
          <p className="app-subtitle mt-2">
            {isDuplicating
              ? "Revise os dados copiados e salve para confirmar o novo gasto."
              : "Registre uma movimentação em poucos campos e mantenha o mês em dia."}
          </p>
          </div>
        </header>

        {error ? (
          <section className="alert-danger p-4 text-sm">
            {error}
          </section>
        ) : null}

        {!error && options.categories.length === 0 ? (
          <section className="alert-warning p-4 text-sm leading-6">
            Nenhuma categoria encontrada. Rode o seed inicial para cadastrar as
            categorias padrão antes de salvar gastos.
          </section>
        ) : null}

        {!error && isEditing && !transaction ? (
          <section className="alert-warning p-4 text-sm">
            Transação não encontrada para edição.
          </section>
        ) : null}

        {!error && isDuplicating && !transaction ? (
          <section className="alert-warning p-4 text-sm">
            Transação não encontrada para duplicação.
          </section>
        ) : null}

        {!error &&
        (!isEditing || transaction) &&
        (!isDuplicating || transaction) &&
        options.categories.length > 0 ? (
          <TransactionForm
            options={options}
            initialTransaction={transaction}
          />
        ) : null}
      </main>
      <MobileNavigation />
    </div>
  );
}

