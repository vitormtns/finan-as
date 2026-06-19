"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { formatCurrency } from "@/lib/formatters";
import { saveGoalsAction, type GoalsActionState } from "@/server/goals/actions";
import type { GoalsPageData } from "@/server/goals/types";

type GoalsFormProps = {
  goals: GoalsPageData;
};

const initialState: GoalsActionState = {
  status: "idle",
  message: "",
};

function formatInputValue(value: number | null) {
  if (value === null) {
    return "";
  }

  return value.toFixed(2).replace(".", ",");
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Salvando..." : "Salvar metas"}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{errors[0]}</p>;
}

export function GoalsForm({ goals }: GoalsFormProps) {
  const [state, formAction] = useActionState(saveGoalsAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="month" value={goals.month} />
      <input type="hidden" name="year" value={goals.year} />

      <section className="premium-panel p-5">
        <label
          className="form-label"
          htmlFor="totalLimit"
        >
          Meta mensal geral
        </label>
        <input
          id="totalLimit"
          name="totalLimit"
          inputMode="decimal"
          placeholder="0,00"
          defaultValue={formatInputValue(goals.totalLimit)}
          className="form-control mt-2 text-base font-bold"
        />
        <FieldError errors={state.fieldErrors?.totalLimit} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-[var(--app-ink)]">
            Metas por categoria
          </h2>
          <p className="mt-1 text-sm text-[var(--app-ink-muted)]">
            Defina limites mensais para as categorias de despesa.
          </p>
        </div>

        {goals.categories.map((category) => {
          const progress = category.percentageUsed ?? 0;
          const progressWidth = Math.min(progress, 100);

          return (
            <article
              key={category.id}
              className="premium-panel p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color ?? "#64748b" }}
                      aria-hidden="true"
                    />
                    <h3 className="truncate text-sm font-semibold text-slate-950">
                      {category.name}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-[var(--app-ink-muted)]">
                    Gasto no mês: {formatCurrency(category.spentAmount)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {category.limitAmount === null
                    ? "Sem meta"
                    : `${progress}%`}
                </span>
              </div>

              <label
                className="mt-4 block form-label"
                htmlFor={`category-${category.id}`}
              >
                Limite mensal
              </label>
              <input
                id={`category-${category.id}`}
                name={`categoryLimit:${category.id}`}
                inputMode="decimal"
                placeholder="Sem meta"
                defaultValue={formatInputValue(category.limitAmount)}
                className="form-control mt-2 min-h-11"
              />

              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${progressWidth}%`,
                    backgroundColor:
                      progress > 100 ? "#ef4444" : category.color ?? "#2563eb",
                  }}
                />
              </div>
            </article>
          );
        })}
      </section>

      {state.message ? (
        <div
          className={`rounded-lg border p-3 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <SaveButton />
    </form>
  );
}

