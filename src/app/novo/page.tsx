import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TransactionForm } from "@/components/finance/transaction-form";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { requireCurrentUserId } from "@/server/auth/current-user";
import {
  findTransactionForEdit,
  listTransactionFormOptions,
} from "@/server/transactions/repository";
import type {
  EditableTransaction,
  TransactionFormOptions,
} from "@/server/transactions/types";

export const dynamic = "force-dynamic";

type NewTransactionPageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

async function loadPageData(id?: string): Promise<{
  options: TransactionFormOptions;
  transaction: EditableTransaction | null;
  error: string | null;
}> {
  const userId = await requireCurrentUserId();

  try {
    const [options, transaction] = await Promise.all([
      listTransactionFormOptions(userId),
      id ? findTransactionForEdit(userId, id) : Promise.resolve(null),
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
  const { id } = await searchParams;
  const { options, transaction, error } = await loadPageData(id);
  const isEditing = Boolean(id);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] pb-28 md:pb-0">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header>
          <Link
            href="/gastos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Voltar para gastos
          </Link>

          <h1 className="mt-5 text-3xl font-semibold text-slate-950">
            {isEditing ? "Editar gasto" : "Novo gasto"}
          </h1>
          <p className="mt-2 text-base leading-7 text-slate-600">
            Registre uma movimentação em poucos campos e mantenha o mês em dia.
          </p>
        </header>

        {error ? (
          <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </section>
        ) : null}

        {!error && options.categories.length === 0 ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Nenhuma categoria encontrada. Rode o seed inicial para cadastrar as
            categorias padrão antes de salvar gastos.
          </section>
        ) : null}

        {!error && isEditing && !transaction ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Transação não encontrada para edição.
          </section>
        ) : null}

        {!error && (!isEditing || transaction) && options.categories.length > 0 ? (
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
