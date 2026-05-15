import Link from "next/link";
import { Edit3, Layers3, Trash2 } from "lucide-react";
import { CategoryForm } from "@/components/finance/category-form";
import { MobileNavigation } from "@/components/finance/mobile-navigation";
import { TRANSACTION_TYPE, transactionTypeLabels } from "@/lib/finance/types";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { deleteCategoryAction } from "@/server/categories/actions";
import {
  getCategoriesPageData,
  getEditableCategory,
} from "@/server/categories/service";
import type {
  CategoriesPageData,
  EditableCategory,
} from "@/server/categories/types";

export const dynamic = "force-dynamic";

type CategoriesPageProps = {
  searchParams: Promise<{
    editar?: string;
  }>;
};

async function loadPageData(id?: string): Promise<{
  data: CategoriesPageData | null;
  editableCategory: EditableCategory | null;
  error: string | null;
}> {
  const userId = await requireCurrentUserId();

  try {
    const [data, editableCategory] = await Promise.all([
      getCategoriesPageData(userId),
      id ? getEditableCategory(userId, id) : Promise.resolve(null),
    ]);

    return { data, editableCategory, error: null };
  } catch {
    return {
      data: null,
      editableCategory: null,
      error:
        "Não foi possível carregar as categorias. Verifique a conexão com o banco.",
    };
  }
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const { editar } = await searchParams;
  const { data, editableCategory, error } = await loadPageData(editar);
  const isEditing = Boolean(editar);
  const expenseCategories =
    data?.categories.filter((category) => category.type === TRANSACTION_TYPE.EXPENSE) ??
    [];
  const incomeCategories =
    data?.categories.filter((category) => category.type === TRANSACTION_TYPE.INCOME) ??
    [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] pb-28 md:pb-0">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 md:py-8">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-sm font-medium text-blue-700 shadow-sm shadow-blue-100/70">
            <Layers3 size={16} aria-hidden="true" />
            Organização
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">
            Categorias
          </h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
            Personalize como seus gastos e receitas aparecem no app.
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
                  {isEditing ? "Editar categoria" : "Nova categoria"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Nomes claros ajudam os relatórios a ficarem mais úteis.
                </p>
              </div>

              {isEditing && !editableCategory ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Categoria não encontrada para edição.
                </div>
              ) : (
                <CategoryForm initialCategory={editableCategory} />
              )}
            </section>

            <section className="space-y-5">
              <CategoryGroup
                title="Despesas"
                categories={expenseCategories}
              />
              <CategoryGroup title="Receitas" categories={incomeCategories} />
            </section>
          </div>
        ) : null}
      </main>
      <MobileNavigation />
    </div>
  );
}

function CategoryGroup({
  title,
  categories,
}: {
  title: string;
  categories: CategoriesPageData["categories"];
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {categories.length} categoria(s) cadastrada(s).
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm shadow-slate-200/70">
          Nenhuma categoria deste tipo ainda.
        </div>
      ) : null}

      {categories.map((category) => (
        <article
          key={category.id}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: category.color ?? "#64748b" }}
                  aria-hidden="true"
                >
                  {category.icon?.slice(0, 2).toUpperCase() ?? "•"}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-slate-950">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {transactionTypeLabels[category.type]} •{" "}
                    {category.transactionsCount} transação(ões)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-1">
              <Link
                href={`/categorias?editar=${category.id}`}
                className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                aria-label="Editar categoria"
              >
                <Edit3 size={17} aria-hidden="true" />
              </Link>

              {category.transactionsCount === 0 ? (
                <form action={deleteCategoryAction}>
                  <input type="hidden" name="id" value={category.id} />
                  <button
                    type="submit"
                    className="flex size-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50"
                    aria-label="Excluir categoria"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </form>
              ) : (
                <span className="flex min-h-9 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-500">
                  Em uso
                </span>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
