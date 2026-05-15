import { formatCurrency } from "@/lib/formatters";

type Category = {
  name: string;
  amount: number;
  percentage: number;
  color: string | null;
};

type CategoryListProps = {
  categories: Category[];
  subtitle?: string;
};

export function CategoryList({
  categories,
  subtitle = "Distribuição do mês atual",
}: CategoryListProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
      <div>
        <h2 className="text-base font-semibold text-slate-950">
          Gastos por categoria
        </h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {categories.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
          Nenhuma despesa registrada neste mês. Quando você lançar gastos, as
          categorias aparecem aqui automaticamente.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {categories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color ?? "#64748b" }}
                  aria-hidden="true"
                />
                <span className="truncate text-sm font-medium text-slate-700">
                  {category.name}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <strong className="block text-sm font-semibold text-slate-950">
                  {formatCurrency(category.amount)}
                </strong>
                <span className="text-xs text-slate-500">
                  {category.percentage}%
                </span>
              </div>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color ?? "#64748b",
                }}
              />
            </div>
          </div>
          ))}
        </div>
      )}
    </section>
  );
}
